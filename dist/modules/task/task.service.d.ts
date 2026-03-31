import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto, SubmitTaskReviewDto, DecideTaskReviewDto } from './dto';
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
        reviewer: {
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
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    })[]>;
    create(dto: CreateTaskDto, creatorId: string): Promise<{
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
        reviewer: {
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
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
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
        reviewer: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
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
        reviews: ({
            actor: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
            reviewer: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            comment: string | null;
            id: string;
            createdAt: Date;
            actorId: string;
            taskId: string;
            action: import(".prisma/client").$Enums.TaskReviewAction;
            reviewerId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
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
        reviewer: {
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
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    }>;
    delete(taskId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
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
        reviewer: {
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
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    }>;
    assignMember(taskId: string, assigneeId: string | null, actorId: string): Promise<{
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
        reviewer: {
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
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
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
    submitForReview(taskId: string, dto: SubmitTaskReviewDto, userId: string): Promise<{
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
        reviewer: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
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
        reviews: ({
            actor: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
            reviewer: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            comment: string | null;
            id: string;
            createdAt: Date;
            actorId: string;
            taskId: string;
            action: import(".prisma/client").$Enums.TaskReviewAction;
            reviewerId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    }>;
    decideReview(taskId: string, dto: DecideTaskReviewDto, userId: string): Promise<{
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
        reviewer: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
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
        reviews: ({
            actor: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
            reviewer: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            comment: string | null;
            id: string;
            createdAt: Date;
            actorId: string;
            taskId: string;
            action: import(".prisma/client").$Enums.TaskReviewAction;
            reviewerId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    }>;
    cancelReview(taskId: string, userId: string): Promise<{
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
        reviewer: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
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
        reviews: ({
            actor: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
            reviewer: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            comment: string | null;
            id: string;
            createdAt: Date;
            actorId: string;
            taskId: string;
            action: import(".prisma/client").$Enums.TaskReviewAction;
            reviewerId: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        reviewDueDate: Date | null;
        dueDate: Date | null;
        position: number;
        priority: import(".prisma/client").$Enums.TaskPriority;
        completed: boolean;
        approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
        reviewSubmittedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        reviewerId: string | null;
    }>;
    addAttachment(taskId: string, file: any, userId: string): Promise<{
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
    private logActivity;
    private normalizeLabels;
    private getTaskReviewContext;
    private ensureCanSubmitForReview;
    private ensureCanDecideReview;
    private ensureValidReviewer;
}
