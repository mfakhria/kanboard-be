"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const fs_1 = require("fs");
const upload_path_util_1 = require("../../common/utils/upload-path.util");
let TaskService = class TaskService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async findAllByWorkspace(workspaceId, userId) {
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
    async create(dto, creatorId) {
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
                action: client_1.ActivityAction.CREATED,
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
    async findById(taskId) {
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
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async update(taskId, dto, userId) {
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
            throw new common_1.NotFoundException('Task not found');
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
            action: dto.completed && !task.completed ? client_1.ActivityAction.COMPLETED : client_1.ActivityAction.UPDATED,
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
    async delete(taskId, userId) {
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
            throw new common_1.NotFoundException('Task not found');
        }
        const deletedTask = await this.prisma.task.delete({
            where: { id: taskId },
        });
        await this.logActivity({
            action: client_1.ActivityAction.DELETED,
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
    async move(taskId, dto, userId) {
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
            throw new common_1.NotFoundException('Task not found');
        }
        const targetColumn = await this.prisma.column.findUnique({
            where: { id: dto.columnId },
            select: { id: true, name: true },
        });
        const movedTask = await this.prisma.$transaction(async (tx) => {
            if (task.columnId !== dto.columnId) {
                await tx.task.updateMany({
                    where: {
                        columnId: task.columnId,
                        position: { gt: task.position },
                    },
                    data: {
                        position: { decrement: 1 },
                    },
                });
                await tx.task.updateMany({
                    where: {
                        columnId: dto.columnId,
                        position: { gte: dto.position },
                    },
                    data: {
                        position: { increment: 1 },
                    },
                });
            }
            else {
                if (dto.position > task.position) {
                    await tx.task.updateMany({
                        where: {
                            columnId: task.columnId,
                            position: { gt: task.position, lte: dto.position },
                        },
                        data: {
                            position: { decrement: 1 },
                        },
                    });
                }
                else if (dto.position < task.position) {
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
                action: client_1.ActivityAction.MOVED,
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
    async assignMember(taskId, assigneeId, actorId) {
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
            throw new common_1.NotFoundException('Task not found');
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
            action: client_1.ActivityAction.ASSIGNED,
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
    async addComment(taskId, content, authorId) {
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
            throw new common_1.NotFoundException('Task not found');
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
            action: client_1.ActivityAction.COMMENTED,
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
    async submitForReview(taskId, dto, userId) {
        const task = await this.getTaskReviewContext(taskId);
        this.ensureCanSubmitForReview(task, userId);
        const reviewerId = dto.reviewerId ?? task.reviewerId;
        if (!reviewerId) {
            throw new common_1.BadRequestException('Please choose a reviewer before submitting');
        }
        if (reviewerId === userId) {
            throw new common_1.BadRequestException('Reviewer must be different from the submitter');
        }
        this.ensureValidReviewer(task, reviewerId);
        const reviewDueDate = dto.reviewDueDate ? new Date(dto.reviewDueDate) : task.reviewDueDate;
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                reviewerId,
                reviewDueDate: reviewDueDate ?? undefined,
                reviewSubmittedAt: new Date(),
                approvalStatus: client_1.TaskApprovalStatus.IN_REVIEW,
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
                action: client_1.TaskReviewAction.SUBMITTED,
                comment: dto.comment?.trim() || undefined,
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'task_review',
            entityId: taskId,
            userId,
            projectId: task.column.board.project.id,
            metadata: {
                taskTitle: task.title,
                projectName: task.column.board.project.name,
                reviewAction: client_1.TaskReviewAction.SUBMITTED,
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
    async decideReview(taskId, dto, userId) {
        if (![client_1.TaskReviewAction.APPROVED, client_1.TaskReviewAction.CHANGES_REQUESTED].includes(dto.decision)) {
            throw new common_1.BadRequestException('Unsupported review decision');
        }
        const task = await this.getTaskReviewContext(taskId);
        if (task.approvalStatus !== client_1.TaskApprovalStatus.IN_REVIEW) {
            throw new common_1.BadRequestException('This task is not currently in review');
        }
        this.ensureCanDecideReview(task, userId);
        const approvalStatus = dto.decision === client_1.TaskReviewAction.APPROVED
            ? client_1.TaskApprovalStatus.APPROVED
            : client_1.TaskApprovalStatus.CHANGES_REQUESTED;
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
            action: client_1.ActivityAction.UPDATED,
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
        const notifyUserIds = new Set([task.creatorId, task.assigneeId].filter((candidate) => !!candidate && candidate !== userId));
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
    async cancelReview(taskId, userId) {
        const task = await this.getTaskReviewContext(taskId);
        if (task.approvalStatus !== client_1.TaskApprovalStatus.IN_REVIEW) {
            throw new common_1.BadRequestException('This task is not currently in review');
        }
        this.ensureCanSubmitForReview(task, userId);
        await this.prisma.task.update({
            where: { id: taskId },
            data: {
                approvalStatus: client_1.TaskApprovalStatus.NONE,
                reviewSubmittedAt: null,
            },
        });
        await this.prisma.taskReview.create({
            data: {
                taskId,
                actorId: userId,
                reviewerId: task.reviewerId ?? undefined,
                action: client_1.TaskReviewAction.CANCELLED,
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'task_review',
            entityId: taskId,
            userId,
            projectId: task.column.board.project.id,
            metadata: {
                taskTitle: task.title,
                projectName: task.column.board.project.name,
                reviewAction: client_1.TaskReviewAction.CANCELLED,
                reviewerId: task.reviewerId,
                reviewerName: task.reviewer?.name ?? null,
            },
        });
        return this.findById(taskId);
    }
    async addAttachment(taskId, file, userId) {
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
            throw new common_1.NotFoundException('Task not found');
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
            action: client_1.ActivityAction.UPDATED,
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
    async deleteAttachment(taskId, attachmentId, userId) {
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
            throw new common_1.NotFoundException('Attachment not found');
        }
        const deletedAttachment = await this.prisma.taskAttachment.delete({
            where: { id: attachmentId },
        });
        const filePath = (0, upload_path_util_1.getTaskAttachmentFilePath)(deletedAttachment.fileName);
        if ((0, fs_1.existsSync)(filePath)) {
            (0, fs_1.unlinkSync)(filePath);
        }
        await this.logActivity({
            action: client_1.ActivityAction.DELETED,
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
    async logActivity(params) {
        await this.prisma.activityLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                userId: params.userId,
                projectId: params.projectId ?? undefined,
                metadata: params.metadata,
            },
        });
    }
    normalizeLabels(labels) {
        return labels
            .map((label) => ({
            name: label.name.trim(),
            color: label.color?.trim() || '#6366f1',
        }))
            .filter((label) => label.name.length > 0);
    }
    async getTaskReviewContext(taskId) {
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
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    ensureCanSubmitForReview(task, userId) {
        const member = task.column.board.project.members.find(projectMember => projectMember.userId === userId);
        const role = member?.role;
        if (!member) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        if (role === 'VIEWER') {
            throw new common_1.ForbiddenException('Viewers cannot submit tasks for review');
        }
    }
    ensureCanDecideReview(task, userId) {
        const member = task.column.board.project.members.find(projectMember => projectMember.userId === userId);
        const role = member?.role;
        if (task.reviewerId === userId) {
            return;
        }
        if (role === 'OWNER' || role === 'ADMIN') {
            return;
        }
        throw new common_1.ForbiddenException('Only the assigned reviewer or project admin can decide this review');
    }
    ensureValidReviewer(task, reviewerId) {
        const reviewerMembership = task.column.board.project.members.find(projectMember => projectMember.userId === reviewerId);
        if (!reviewerMembership) {
            throw new common_1.BadRequestException('Reviewer must belong to this project');
        }
        if (reviewerMembership.role === 'VIEWER') {
            throw new common_1.BadRequestException('Viewer cannot be assigned as reviewer');
        }
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], TaskService);
//# sourceMappingURL=task.service.js.map