import { TaskPriority } from '@prisma/client';
declare class TaskLabelInputDto {
    name: string;
    color?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    labels?: TaskLabelInputDto[];
    completed?: boolean;
}
export {};
