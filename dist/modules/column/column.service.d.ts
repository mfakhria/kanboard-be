import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
export declare class ColumnService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateColumnDto): Promise<{
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            dueDate: Date | null;
            position: number;
            title: string;
            priority: import(".prisma/client").$Enums.TaskPriority;
            completed: boolean;
            columnId: string;
            assigneeId: string | null;
            creatorId: string;
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
