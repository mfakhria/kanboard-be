import { PrismaService } from '../../prisma/prisma.service';
export declare class BoardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByProject(projectId: string): Promise<({
        columns: ({
            tasks: ({
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
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            position: number;
            boardId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
    })[]>;
    findById(boardId: string): Promise<{
        columns: ({
            tasks: ({
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
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            position: number;
            boardId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
    }>;
}
