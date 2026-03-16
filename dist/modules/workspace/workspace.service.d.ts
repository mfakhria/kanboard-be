import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto, InviteMemberDto, AssignRoleDto } from './dto';
export declare class WorkspaceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateWorkspaceDto, userId: string): Promise<{
        members: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    }>;
    findAllByUser(userId: string): Promise<({
        _count: {
            projects: number;
        };
        members: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    })[]>;
    findById(workspaceId: string, userId: string): Promise<{
        projects: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            workspaceId: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            visibility: import(".prisma/client").$Enums.ProjectVisibility;
            color: string | null;
            icon: string | null;
            dueDate: Date | null;
            picId: string | null;
        }[];
        members: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
            userId: string;
            workspaceId: string;
        })[];
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    }>;
    update(workspaceId: string, dto: UpdateWorkspaceDto, userId: string): Promise<{
        members: ({
            user: {
                name: string;
                email: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
            userId: string;
            workspaceId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    }>;
    inviteMember(workspaceId: string, dto: InviteMemberDto, inviterId: string): Promise<{
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        inviter: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
        invitee: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        workspaceId: string;
        status: import(".prisma/client").$Enums.WorkspaceInvitationStatus;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    }>;
    getPendingInvitations(userId: string): Promise<({
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        inviter: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        workspaceId: string;
        status: import(".prisma/client").$Enums.WorkspaceInvitationStatus;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    })[]>;
    acceptInvitation(invitationId: string, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
        userId: string;
        workspaceId: string;
    }>;
    declineInvitation(invitationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        workspaceId: string;
        status: import(".prisma/client").$Enums.WorkspaceInvitationStatus;
        respondedAt: Date | null;
        inviterId: string;
        inviteeId: string;
    }>;
    listMembers(workspaceId: string, userId: string): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
        userId: string;
        workspaceId: string;
    })[]>;
    assignRole(workspaceId: string, memberId: string, dto: AssignRoleDto, assignerId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
        userId: string;
        workspaceId: string;
    }>;
    removeMember(workspaceId: string, memberId: string, removerId: string): Promise<{
        message: string;
    }>;
    delete(workspaceId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    }>;
    private ensureMember;
    private ensureRole;
    private generateSlug;
}
