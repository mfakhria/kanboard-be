import { WorkspaceRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: WorkspaceRole[]) => import("@nestjs/common").CustomDecorator<string>;
