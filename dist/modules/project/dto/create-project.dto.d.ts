import { ProjectVisibility } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    dueDate?: string;
    picId?: string;
    visibility?: ProjectVisibility;
    workspaceId: string;
}
