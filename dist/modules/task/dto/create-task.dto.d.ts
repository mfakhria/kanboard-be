import { TaskPriority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    columnId: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    position?: number;
}
