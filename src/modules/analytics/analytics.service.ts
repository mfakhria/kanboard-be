import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceStats(workspaceId: string) {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      archivedProjects,
    ] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.project.count({ where: { workspaceId, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { workspaceId, status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { workspaceId, status: 'ARCHIVED' } }),
    ]);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      archivedProjects,
    };
  }

  async getProjectStats(projectId: string) {
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

    // Collect task statistics
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

    // Tasks per column
    const columnsWithCounts = project.boards.flatMap((board) =>
      board.columns.map((col) => ({
        columnId: col.id,
        columnName: col.name,
        taskCount: col._count.tasks,
      })),
    );

    // Tasks by priority
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

  async getWeeklySummary(workspaceId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Tasks created this week
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

    // Tasks completed this week
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

    // Activity logs this week
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

    // Daily breakdown for the week
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
}
