import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByWorkspace(workspaceId: string, userId: string) {
    // First determine if user is workspace OWNER/ADMIN
    const wsMember = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);

    return this.prisma.task.findMany({
      where: {
        column: {
          board: {
            project: {
              workspaceId,
              ...(!isWsAdmin && {
                OR: [
                  { members: { some: { userId } } },
                  { visibility: 'PUBLIC' },
                ],
              }),
            },
          },
        },
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        labels: true,
        column: {
          select: {
            id: true,
            name: true,
            board: {
              select: { id: true, name: true, projectId: true },
            },
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTaskDto, creatorId: string) {
    // Get the max position for existing tasks in this column
    const maxPosition = await this.prisma.task.aggregate({
      where: { columnId: dto.columnId },
      _max: { position: true },
    });

    const position = dto.position ?? (maxPosition._max.position ?? -1) + 1;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        columnId: dto.columnId,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
        creatorId,
        position,
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
          select: { comments: true },
        },
      },
    });
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        labels: true,
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
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
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
        labels: true,
        _count: {
          select: { comments: true },
        },
      },
    });
  }

  async delete(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async move(taskId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Use transaction to update positions atomically
    return this.prisma.$transaction(async (tx) => {
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
          labels: true,
          _count: {
            select: { comments: true },
          },
        },
      });
    });
  }

  async assignMember(taskId: string, assigneeId: string | null) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
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
      },
    });
  }

  async addComment(taskId: string, content: string, authorId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.comment.create({
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
  }
}
