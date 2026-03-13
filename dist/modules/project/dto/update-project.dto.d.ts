import { ProjectStatus, ProjectVisibility } from '@prisma/client';
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    dueDate?: string;
    picId?: string;
    status?: ProjectStatus;
    visibility?: ProjectVisibility;
}
