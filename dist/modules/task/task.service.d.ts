import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
export declare class TaskService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        labels: {
            name: string;
            id: string;
            color: string;
            taskId: string;
        }[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
        creatorId: string;
    })[]>;
    create(dto: CreateTaskDto, creatorId: string): Promise<{
        _count: {
            comments: number;
        };
        labels: {
            name: string;
            id: string;
            color: string;
            taskId: string;
        }[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
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
            content: string;
            taskId: string;
            authorId: string;
        })[];
        labels: {
            name: string;
            id: string;
            color: string;
            taskId: string;
        }[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
        creatorId: string;
    }>;
    update(taskId: string, dto: UpdateTaskDto): Promise<{
        _count: {
            comments: number;
        };
        labels: {
            name: string;
            id: string;
            color: string;
            taskId: string;
        }[];
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
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
        creatorId: string;
    }>;
    delete(taskId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
        creatorId: string;
    }>;
    move(taskId: string, dto: MoveTaskDto): Promise<{
        _count: {
            comments: number;
        };
        labels: {
            name: string;
            id: string;
            color: string;
            taskId: string;
        }[];
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
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
        creatorId: string;
    }>;
    assignMember(taskId: string, assigneeId: string | null): Promise<{
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
        dueDate: Date | null;
        position: number;
        title: string;
        columnId: string;
        priority: import(".prisma/client").$Enums.TaskPriority;
        assigneeId: string | null;
        completed: boolean;
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
        content: string;
        taskId: string;
        authorId: string;
    }>;
}
