import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    findAll(workspaceId: string, userId: string): Promise<({
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
    create(dto: CreateTaskDto, userId: string): Promise<{
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
    findOne(taskId: string): Promise<{
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
    assign(taskId: string, assigneeId: string | null): Promise<{
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
    addComment(taskId: string, content: string, userId: string): Promise<{
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
