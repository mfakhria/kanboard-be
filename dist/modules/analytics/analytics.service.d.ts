import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWorkspaceStats(workspaceId: string, userId?: string): Promise<{
        totalProjects: number;
        activeProjects: number;
        completedProjects: number;
        archivedProjects: number;
    }>;
    getProjectStats(projectId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        completionRate: number;
        columnsWithCounts: {
            columnId: string;
            columnName: string;
            taskCount: number;
        }[];
        tasksByPriority: {
            priority: import(".prisma/client").$Enums.TaskPriority;
            count: number;
        }[];
    } | null>;
    getWeeklySummary(workspaceId: string): Promise<{
        tasksCreated: number;
        tasksCompleted: number;
        recentActivities: ({
            user: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            projectId: string | null;
            action: import(".prisma/client").$Enums.ActivityAction;
            entity: string;
            entityId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        dailyStats: {
            date: string;
            created: number;
            completed: number;
        }[];
    }>;
    getOverviewStats(workspaceId: string, userId?: string): Promise<{
        taskStats: {
            total: number;
            completed: number;
            inProgress: number;
            overdue: number;
        };
        taskDistribution: {
            label: string;
            count: number;
            percentage: number;
        }[];
        tasksByPriority: {
            priority: import(".prisma/client").$Enums.TaskPriority;
            count: number;
        }[];
        weeklyTrend: {
            weekLabel: string;
            completed: number;
            created: number;
            overdue: number;
        }[];
    }>;
}
