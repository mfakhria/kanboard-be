import { TaskPriority } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    completed?: boolean;
}
