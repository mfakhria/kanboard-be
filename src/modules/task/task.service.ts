import {
  ActivityAction,
  Prisma,
  TaskApprovalStatus,
  TaskReviewAction,
} from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  SubmitTaskReviewDto,
  DecideTaskReviewDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAllByWorkspace(workspaceId: string, userId: string) {
    return this.prisma.task.findMany({
      where: {
        column: {
          board: {
            project: {
              workspaceId,
              OR: [
                { members: { some: { userId } } },
                { visibility: 'PUBLIC' },
              ],
            },
          },
        },
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reviewer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: true,
        _count: { select: { comments: true, attachments: true } },
        column: {
          select: {
            id: true,
            name: true,
            board: {
              select: { id: true, name: true, projectId: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTaskDto, creatorId: string) {
    const columnContext = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
      include: {
        board: {
          include: {
            project: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Get the max position for existing tasks in this column
    const maxPosition = await this.prisma.task.aggregate({
      where: { columnId: dto.columnId },
      _max: { position: true },
    });

    const position = dto.position ?? (maxPosition._max.position ?? -1) + 1;

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        columnId: dto.columnId,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        creatorId,
        position,
        labels: dto.labels?.length
          ? {
              create: this.normalizeLabels(dto.labels),
            }
          : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    if (task.assignee && task.assignee.id !== creatorId) {
      await this.notificationService.notifyTaskAssigned({
        userId: task.assignee.id,
        actorId: creatorId,
        taskId: task.id,
        taskTitle: task.title,
      });
    }

    if (columnContext) {
      await this.logActivity({
        action: ActivityAction.CREATED,
        entity: 'task',
        entityId: task.id,
        userId: creatorId,
        projectId: columnContext.board.project.id,
        metadata: {
          taskTitle: task.title,
          columnName: columnContext.name,
          projectName: columnContext.board.project.name,
        },
      });
    }

    return task;
  }

  async findById(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        attachments: {
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        column: {
          select: {
            id: true,
            name: true,
            board: {
              select: {
                id: true,
                name: true,
                projectId: true,
              },
            },
          },
        },
        reviews: {
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        completed: dto.completed,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        labels: dto.labels
          ? {
              deleteMany: {},
              create: this.normalizeLabels(dto.labels),
            }
          : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    await this.logActivity({
      action: dto.completed && !task.completed ? ActivityAction.COMPLETED : ActivityAction.UPDATED,
      entity: 'task',
      entityId: updatedTask.id,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: updatedTask.title,
        projectName: task.column.board.project.name,
        changedFields: Object.keys(dto),
      },
    });

    return updatedTask;
  }

  async delete(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const deletedTask = await this.prisma.task.delete({
      where: { id: taskId },
    });

    await this.logActivity({
      action: ActivityAction.DELETED,
      entity: 'task',
      entityId: deletedTask.id,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: deletedTask.title,
        projectName: task.column.board.project.name,
      },
    });

    return deletedTask;
  }

  async move(taskId: string, dto: MoveTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const targetColumn = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
      select: { id: true, name: true },
    });

    // Use transaction to update positions atomically
    const movedTask = await this.prisma.$transaction(async (tx) => {
      // If moving to a different column, shift tasks in the old and new columns
      if (task.columnId !== dto.columnId) {
        // Decrease position of tasks after this one in old column
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            position: { gt: task.position },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // Increase position of tasks at or after target position in new column
        await tx.task.updateMany({
          where: {
            columnId: dto.columnId,
            position: { gte: dto.position },
          },
          data: {
            position: { increment: 1 },
          },
        });
      } else {
        // Moving within the same column
        if (dto.position > task.position) {
          // Moving down: shift tasks between old and new position up
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              position: { gt: task.position, lte: dto.position },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else if (dto.position < task.position) {
          // Moving up: shift tasks between new and old position down
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              position: { gte: dto.position, lt: task.position },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }
      }

      // Update the task's column and position
      return tx.task.update({
        where: { id: taskId },
        data: {
          columnId: dto.columnId,
          position: dto.position,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          labels: true,
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      });
    });

    const taskContext = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (taskContext) {
      await this.logActivity({
        action: ActivityAction.MOVED,
        entity: 'task',
        entityId: movedTask.id,
        userId,
        projectId: taskContext.column.board.project.id,
        metadata: {
          taskTitle: movedTask.title,
          fromColumnId: task.columnId,
          fromColumnName: task.column.name,
          fromPosition: task.position,
          toColumnId: dto.columnId,
          toPosition: dto.position,
          toColumnName: targetColumn?.name,
          projectName: taskContext.column.board.project.name,
        },
      });
    }

    return movedTask;
  }

  async assignMember(taskId: string, assigneeId: string | null, actorId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { assigneeId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    if (updated.assignee && updated.assignee.id !== actorId) {
      await this.notificationService.notifyTaskAssigned({
        userId: updated.assignee.id,
        actorId,
        taskId: updated.id,
        taskTitle: updated.title,
        projectId: task.column.board.project.id,
        projectName: task.column.board.project.name,
      });
    }

    await this.logActivity({
      action: ActivityAction.ASSIGNED,
      entity: 'task',
      entityId: updated.id,
      userId: actorId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: updated.title,
        assigneeName: updated.assignee?.name ?? null,
        assigneeId,
        projectName: task.column.board.project.name,
      },
    });

    return updated;
  }

  async addComment(taskId: string, content: string, authorId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        taskId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await this.logActivity({
      action: ActivityAction.COMMENTED,
      entity: 'comment',
      entityId: comment.id,
      userId: authorId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: task.title,
        projectName: task.column.board.project.name,
        commentPreview: content.slice(0, 120),
      },
    });

    return comment;
  }

  async submitForReview(taskId: string, dto: SubmitTaskReviewDto, userId: string) {
    const task = await this.getTaskReviewContext(taskId);

    this.ensureCanSubmitForReview(task, userId);

    const reviewerId = dto.reviewerId ?? task.reviewerId;
    if (!reviewerId) {
      throw new BadRequestException('Please choose a reviewer before submitting');
    }

    if (reviewerId === userId) {
      throw new BadRequestException('Reviewer must be different from the submitter');
    }

    this.ensureValidReviewer(task, reviewerId);

    const reviewDueDate = dto.reviewDueDate ? new Date(dto.reviewDueDate) : task.reviewDueDate;

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        reviewerId,
        reviewDueDate: reviewDueDate ?? undefined,
        reviewSubmittedAt: new Date(),
        approvalStatus: TaskApprovalStatus.IN_REVIEW,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    await this.prisma.taskReview.create({
      data: {
        taskId,
        actorId: userId,
        reviewerId,
        action: TaskReviewAction.SUBMITTED,
        comment: dto.comment?.trim() || undefined,
      },
    });

    await this.logActivity({
      action: ActivityAction.UPDATED,
      entity: 'task_review',
      entityId: taskId,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: task.title,
        projectName: task.column.board.project.name,
        reviewAction: TaskReviewAction.SUBMITTED,
        reviewerId,
        reviewerName: updatedTask.reviewer?.name ?? null,
        reviewDueDate: reviewDueDate?.toISOString() ?? null,
        commentPreview: dto.comment?.slice(0, 120) ?? null,
      },
    });

    if (updatedTask.reviewer && updatedTask.reviewer.id !== userId) {
      await this.notificationService.notifyTaskReviewSubmitted({
        userId: updatedTask.reviewer.id,
        actorId: userId,
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        projectId: task.column.board.project.id,
        projectName: task.column.board.project.name,
        reviewDueDate,
      });
    }

    return this.findById(taskId);
  }

  async decideReview(taskId: string, dto: DecideTaskReviewDto, userId: string) {
    if (![TaskReviewAction.APPROVED, TaskReviewAction.CHANGES_REQUESTED].includes(dto.decision)) {
      throw new BadRequestException('Unsupported review decision');
    }

    const task = await this.getTaskReviewContext(taskId);

    if (task.approvalStatus !== TaskApprovalStatus.IN_REVIEW) {
      throw new BadRequestException('This task is not currently in review');
    }

    this.ensureCanDecideReview(task, userId);

    const approvalStatus = dto.decision === TaskReviewAction.APPROVED
      ? TaskApprovalStatus.APPROVED
      : TaskApprovalStatus.CHANGES_REQUESTED;

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        approvalStatus,
        reviewSubmittedAt: null,
      },
    });

    await this.prisma.taskReview.create({
      data: {
        taskId,
        actorId: userId,
        reviewerId: task.reviewerId ?? userId,
        action: dto.decision,
        comment: dto.comment?.trim() || undefined,
      },
    });

    await this.logActivity({
      action: ActivityAction.UPDATED,
      entity: 'task_review',
      entityId: taskId,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: task.title,
        projectName: task.column.board.project.name,
        reviewAction: dto.decision,
        reviewerId: task.reviewerId,
        reviewerName: task.reviewer?.name ?? null,
        commentPreview: dto.comment?.slice(0, 120) ?? null,
      },
    });

    const notifyUserIds = new Set(
      [task.creatorId, task.assigneeId].filter((candidate): candidate is string => !!candidate && candidate !== userId),
    );

    for (const recipientId of notifyUserIds) {
      await this.notificationService.notifyTaskReviewDecision({
        userId: recipientId,
        actorId: userId,
        taskId: task.id,
        taskTitle: task.title,
        projectId: task.column.board.project.id,
        projectName: task.column.board.project.name,
        decision: dto.decision,
        comment: dto.comment,
      });
    }

    return this.findById(taskId);
  }

  async cancelReview(taskId: string, userId: string) {
    const task = await this.getTaskReviewContext(taskId);

    if (task.approvalStatus !== TaskApprovalStatus.IN_REVIEW) {
      throw new BadRequestException('This task is not currently in review');
    }

    this.ensureCanSubmitForReview(task, userId);

    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        approvalStatus: TaskApprovalStatus.NONE,
        reviewSubmittedAt: null,
      },
    });

    await this.prisma.taskReview.create({
      data: {
        taskId,
        actorId: userId,
        reviewerId: task.reviewerId ?? undefined,
        action: TaskReviewAction.CANCELLED,
      },
    });

    await this.logActivity({
      action: ActivityAction.UPDATED,
      entity: 'task_review',
      entityId: taskId,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: task.title,
        projectName: task.column.board.project.name,
        reviewAction: TaskReviewAction.CANCELLED,
        reviewerId: task.reviewerId,
        reviewerName: task.reviewer?.name ?? null,
      },
    });

    return this.findById(taskId);
  }

  async addAttachment(taskId: string, file: any, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const attachment = await this.prisma.taskAttachment.create({
      data: {
        taskId,
        uploaderId: userId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/task-attachments/${file.filename}`,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await this.logActivity({
      action: ActivityAction.UPDATED,
      entity: 'task_attachment',
      entityId: attachment.id,
      userId,
      projectId: task.column.board.project.id,
      metadata: {
        taskTitle: task.title,
        projectName: task.column.board.project.name,
        fileName: attachment.originalName,
        changedFields: ['attachments'],
      },
    });

    return attachment;
  }

  async deleteAttachment(taskId: string, attachmentId: string, userId: string) {
    const attachment = await this.prisma.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
      },
      include: {
        task: {
          include: {
            column: {
              include: {
                board: {
                  include: {
                    project: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const deletedAttachment = await this.prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    const filePath = join(process.cwd(), 'uploads', 'task-attachments', deletedAttachment.fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.logActivity({
      action: ActivityAction.DELETED,
      entity: 'task_attachment',
      entityId: deletedAttachment.id,
      userId,
      projectId: attachment.task.column.board.project.id,
      metadata: {
        taskTitle: attachment.task.title,
        projectName: attachment.task.column.board.project.name,
        fileName: deletedAttachment.originalName,
      },
    });

    return deletedAttachment;
  }

  private async logActivity(params: {
    action: ActivityAction;
    entity: string;
    entityId: string;
    userId: string;
    projectId?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.activityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
        projectId: params.projectId ?? undefined,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private normalizeLabels(labels: Array<{ name: string; color?: string }>) {
    return labels
      .map((label) => ({
        name: label.name.trim(),
        color: label.color?.trim() || '#6366f1',
      }))
      .filter((label) => label.name.length > 0);
  }

  private async getTaskReviewContext(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        column: {
          include: {
            board: {
              include: {
                project: {
                  include: {
                    members: {
                      select: {
                        userId: true,
                        role: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private ensureCanSubmitForReview(task: Awaited<ReturnType<TaskService['getTaskReviewContext']>>, userId: string) {
    const member = task.column.board.project.members.find(projectMember => projectMember.userId === userId);
    const role = member?.role;

    if (!member) {
      throw new ForbiddenException('You do not have access to this task');
    }

    if (role === 'VIEWER') {
      throw new ForbiddenException('Viewers cannot submit tasks for review');
    }
  }

  private ensureCanDecideReview(task: Awaited<ReturnType<TaskService['getTaskReviewContext']>>, userId: string) {
    const member = task.column.board.project.members.find(projectMember => projectMember.userId === userId);
    const role = member?.role;

    if (task.reviewerId === userId) {
      return;
    }

    if (role === 'OWNER' || role === 'ADMIN') {
      return;
    }

    throw new ForbiddenException('Only the assigned reviewer or project admin can decide this review');
  }

  private ensureValidReviewer(task: Awaited<ReturnType<TaskService['getTaskReviewContext']>>, reviewerId: string) {
    const reviewerMembership = task.column.board.project.members.find(projectMember => projectMember.userId === reviewerId);

    if (!reviewerMembership) {
      throw new BadRequestException('Reviewer must belong to this project');
    }

    if (reviewerMembership.role === 'VIEWER') {
      throw new BadRequestException('Viewer cannot be assigned as reviewer');
    }
  }
}
