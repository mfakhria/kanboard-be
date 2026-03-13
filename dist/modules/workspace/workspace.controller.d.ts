import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto, InviteMemberDto, AssignRoleDto } from './dto';
export declare class WorkspaceController {
    private readonly workspaceService;
    constructor(workspaceService: WorkspaceService);
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
    findAll(userId: string): Promise<({
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
    findOne(workspaceId: string, userId: string): Promise<{
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
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
    }>;
    inviteMember(workspaceId: string, dto: InviteMemberDto, userId: string): Promise<{
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
    assignRole(workspaceId: string, memberId: string, dto: AssignRoleDto, userId: string): Promise<{
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
    removeMember(workspaceId: string, memberId: string, userId: string): Promise<{
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
}
