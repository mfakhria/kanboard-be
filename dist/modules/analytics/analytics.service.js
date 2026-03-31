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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWorkspaceStats(workspaceId, userId) {
        let projectFilter = { workspaceId };
        if (userId) {
            projectFilter = {
                workspaceId,
                OR: [
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' },
                ],
            };
        }
        const [totalProjects, activeProjects, completedProjects, archivedProjects,] = await Promise.all([
            this.prisma.project.count({ where: projectFilter }),
            this.prisma.project.count({ where: { ...projectFilter, status: 'ACTIVE' } }),
            this.prisma.project.count({ where: { ...projectFilter, status: 'COMPLETED' } }),
            this.prisma.project.count({ where: { ...projectFilter, status: 'ARCHIVED' } }),
        ]);
        return {
            totalProjects,
            activeProjects,
            completedProjects,
            archivedProjects,
        };
    }
    async getProjectStats(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                boards: {
                    include: {
                        columns: {
                            include: {
                                _count: {
                                    select: { tasks: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!project) {
            return null;
        }
        const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
            this.prisma.task.count({
                where: {
                    column: {
                        board: { projectId },
                    },
                },
            }),
            this.prisma.task.count({
                where: {
                    column: {
                        board: { projectId },
                    },
                    completed: true,
                },
            }),
            this.prisma.task.count({
                where: {
                    column: {
                        board: { projectId },
                    },
                    completed: false,
                    dueDate: { lt: new Date() },
                },
            }),
        ]);
        const completionRate = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;
        const columnsWithCounts = project.boards.flatMap((board) => board.columns.map((col) => ({
            columnId: col.id,
            columnName: col.name,
            taskCount: col._count.tasks,
        })));
        const tasksByPriority = await this.prisma.task.groupBy({
            by: ['priority'],
            where: {
                column: {
                    board: { projectId },
                },
            },
            _count: true,
        });
        return {
            totalTasks,
            completedTasks,
            overdueTasks,
            completionRate,
            columnsWithCounts,
            tasksByPriority: tasksByPriority.map((t) => ({
                priority: t.priority,
                count: t._count,
            })),
        };
    }
    async getWeeklySummary(workspaceId) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const tasksCreated = await this.prisma.task.count({
            where: {
                createdAt: { gte: sevenDaysAgo },
                column: {
                    board: {
                        project: { workspaceId },
                    },
                },
            },
        });
        const tasksCompleted = await this.prisma.task.count({
            where: {
                completed: true,
                updatedAt: { gte: sevenDaysAgo },
                column: {
                    board: {
                        project: { workspaceId },
                    },
                },
            },
        });
        const recentActivities = await this.prisma.activityLog.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo },
                project: { workspaceId },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(now);
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);
            const [created, completed] = await Promise.all([
                this.prisma.task.count({
                    where: {
                        createdAt: { gte: dayStart, lte: dayEnd },
                        column: {
                            board: {
                                project: { workspaceId },
                            },
                        },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        completed: true,
                        updatedAt: { gte: dayStart, lte: dayEnd },
                        column: {
                            board: {
                                project: { workspaceId },
                            },
                        },
                    },
                }),
            ]);
            dailyStats.push({
                date: dayStart.toISOString().split('T')[0],
                created,
                completed,
            });
        }
        return {
            tasksCreated,
            tasksCompleted,
            recentActivities,
            dailyStats,
        };
    }
    async getOverviewStats(workspaceId, userId) {
        let projectFilter = { workspaceId };
        if (userId) {
            projectFilter = {
                workspaceId,
                OR: [
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' },
                ],
            };
        }
        const allTasks = await this.prisma.task.findMany({
            where: {
                column: { board: { project: projectFilter } },
            },
            include: {
                column: { select: { name: true } },
            },
        });
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.completed).length;
        const overdueTasks = allTasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date()).length;
        const inProgressTasks = totalTasks - completedTasks - overdueTasks;
        const columnCounts = {};
        for (const task of allTasks) {
            const colName = task.column.name;
            columnCounts[colName] = (columnCounts[colName] || 0) + 1;
        }
        const taskDistribution = Object.entries(columnCounts).map(([name, count]) => ({
            label: name,
            count,
            percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
        }));
        const tasksByPriority = await this.prisma.task.groupBy({
            by: ['priority'],
            where: {
                column: { board: { project: projectFilter } },
            },
            _count: true,
        });
        const now = new Date();
        const weeklyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            weekEnd.setHours(23, 59, 59, 999);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);
            const [completed, created] = await Promise.all([
                this.prisma.task.count({
                    where: {
                        completed: true,
                        updatedAt: { gte: weekStart, lte: weekEnd },
                        column: { board: { project: projectFilter } },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        createdAt: { gte: weekStart, lte: weekEnd },
                        column: { board: { project: projectFilter } },
                    },
                }),
            ]);
            weeklyTrend.push({
                weekLabel: `Wk ${6 - i}`,
                completed,
                created,
                overdue: 0,
            });
        }
        for (const week of weeklyTrend) {
            const idx = weeklyTrend.indexOf(week);
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - ((5 - idx) * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            week.overdue = await this.prisma.task.count({
                where: {
                    completed: false,
                    dueDate: { gte: weekStart, lte: weekEnd },
                    column: { board: { project: projectFilter } },
                },
            });
        }
        return {
            taskStats: {
                total: totalTasks,
                completed: completedTasks,
                inProgress: inProgressTasks,
                overdue: overdueTasks,
            },
            taskDistribution,
            tasksByPriority: tasksByPriority.map(t => ({
                priority: t.priority,
                count: t._count,
            })),
            weeklyTrend,
        };
    }
    async getActivityLog(workspaceId, userId) {
        let projectFilter = { workspaceId };
        if (userId) {
            projectFilter = {
                workspaceId,
                OR: [
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' },
                ],
            };
        }
        return this.prisma.activityLog.findMany({
            where: {
                project: projectFilter,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        icon: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map