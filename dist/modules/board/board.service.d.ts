import { PrismaService } from '../../prisma/prisma.service';
export declare class BoardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByProject(projectId: string): Promise<({
        columns: ({
            tasks: ({
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
