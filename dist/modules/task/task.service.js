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
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
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
    async create(dto, creatorId) {
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
        if (task.assignee && task.assignee.id !== creatorId) {
            await this.notificationService.notifyTaskAssigned({
                userId: task.assignee.id,
                actorId: creatorId,
                taskId: task.id,
                taskTitle: task.title,
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
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async update(taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
    async delete(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.task.delete({
            where: { id: taskId },
        });
    }
    async move(taskId, dto) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.$transaction(async (tx) => {
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
                    labels: true,
                    _count: {
                        select: { comments: true },
                    },
                },
            });
        });
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
        return updated;
    }
    async addComment(taskId, content, authorId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], TaskService);
//# sourceMappingURL=task.service.js.map