import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    private static getUploadDestination;
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
            attachments: number;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    })[]>;
    create(dto: CreateTaskDto, userId: string): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
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
            taskId: string;
            content: string;
            authorId: string;
        })[];
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
        attachments: ({
            uploader: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            taskId: string;
            fileName: string;
            originalName: string;
            mimeType: string;
            size: number;
            url: string;
            uploaderId: string;
        })[];
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
            attachments: number;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
            attachments: number;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
    }>;
    assign(taskId: string, assigneeId: string | null, userId: string): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        labels: {
            name: string;
            id: string;
            taskId: string;
            color: string;
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
        title: string;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        columnId: string;
        assigneeId: string | null;
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
        taskId: string;
        content: string;
        authorId: string;
    }>;
    uploadAttachment(taskId: string, file: any, userId: string): Promise<{
        uploader: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        taskId: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        uploaderId: string;
    }>;
    deleteAttachment(taskId: string, attachmentId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        taskId: string;
        fileName: string;
        originalName: string;
        mimeType: string;
        size: number;
        url: string;
        uploaderId: string;
    }>;
}
