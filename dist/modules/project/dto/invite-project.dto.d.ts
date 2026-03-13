import { ProjectRole } from '@prisma/client';
export declare class InviteToProjectDto {
    email: string;
    role?: ProjectRole;
}
export declare class AcceptInvitationDto {
    token: string;
}
export declare class UpdateMemberRoleDto {
    role: ProjectRole;
}
