import { TaskPriority } from '@prisma/client';
declare class TaskLabelInputDto {
    name: string;
    color?: string;
}
export declare class CreateTaskDto {
    title: string;
    description?: string;
    columnId: string;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    labels?: TaskLabelInputDto[];
    position?: number;
}
export {};
