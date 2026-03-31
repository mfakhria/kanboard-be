import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
import { NotificationService } from '../notification/notification.service';
export declare class TaskService {
    private readonly prisma;
    private readonly notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    findAllByWorkspace(workspaceId: string, userId: string): Promise<({
        column: {
            board: {
                name: string;
                id: string;
                projectId: string;
            };
            name: string;
            id: string;
        };
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        creator: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    })[]>;
    create(dto: CreateTaskDto, creatorId: string): Promise<{
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        creator: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    findById(taskId: string): Promise<{
        column: {
            board: {
                name: string;
                id: string;
                projectId: string;
            };
            name: string;
            id: string;
        };
        comments: ({
            author: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            content: string;
            authorId: string;
        })[];
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        creator: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    update(taskId: string, dto: UpdateTaskDto, userId: string): Promise<{
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    delete(taskId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    move(taskId: string, dto: MoveTaskDto, userId: string): Promise<{
        _count: {
            comments: number;
        };
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    assignMember(taskId: string, assigneeId: string | null, actorId: string): Promise<{
        assignee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    addComment(taskId: string, content: string, authorId: string): Promise<{
        author: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        content: string;
        authorId: string;
    }>;
    private logActivity;
}
