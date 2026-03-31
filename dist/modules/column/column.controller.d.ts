import { ColumnService } from './column.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
export declare class ColumnController {
    private readonly columnService;
    constructor(columnService: ColumnService);
    create(dto: CreateColumnDto): Promise<{
        tasks: {
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
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        position: number;
        boardId: string;
    }>;
    update(columnId: string, dto: UpdateColumnDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        position: number;
        boardId: string;
    }>;
    delete(columnId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        position: number;
        boardId: string;
    }>;
    reorder(dto: ReorderColumnsDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        position: number;
        boardId: string;
    }[]>;
}
