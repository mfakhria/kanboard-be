import { BoardService } from './board.service';
export declare class BoardController {
    private readonly boardService;
    constructor(boardService: BoardService);
    findByProject(projectId: string): Promise<({
        columns: ({
            tasks: ({
                _count: {
                    comments: number;
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
    findOne(boardId: string): Promise<{
        columns: ({
            tasks: ({
                _count: {
                    comments: number;
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
