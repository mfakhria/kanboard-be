import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, InviteToProjectDto, UpdateMemberRoleDto } from './dto';
export declare class ProjectService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, userId: string): Promise<{
        pic: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        boards: ({
            columns: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                position: number;
                boardId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
        })[];
    } & {
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
    }>;
    findAllByWorkspace(workspaceId: string, userId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        myRole: import(".prisma/client").$Enums.ProjectRole;
        pic: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
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
    }[]>;
    findById(projectId: string, userId: string): Promise<{
        workspace: {
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
            role: import(".prisma/client").$Enums.ProjectRole;
            joinedAt: Date;
            userId: string;
            projectId: string;
        })[];
        pic: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        boards: ({
            columns: ({
                tasks: ({
                    _count: {
                        comments: number;
                    };
                    assignee: {
                        name: string;
                        email: string;
                        id: string;
                        avatar: string | null;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    dueDate: Date | null;
                    position: number;
                    title: string;
                    columnId: string;
                    priority: import(".prisma/client").$Enums.TaskPriority;
                    assigneeId: string | null;
                    completed: boolean;
                    creatorId: string;
                })[];
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                position: number;
                boardId: string;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
        })[];
    } & {
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
    }>;
    update(projectId: string, dto: UpdateProjectDto, userId: string): Promise<{
        pic: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    delete(projectId: string, userId: string): Promise<{
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
    }>;
    private ensureWorkspaceMember;
    private ensureProjectAdmin;
    inviteMember(projectId: string, dto: InviteToProjectDto, inviterId: string): Promise<{
        project: {
            name: string;
            id: string;
        };
        inviter: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        projectId: string;
        expiresAt: Date;
    }>;
    acceptInvitation(token: string, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
        project: {
            name: string;
            id: string;
            workspaceId: string;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        userId: string;
        projectId: string;
    }>;
    declineInvitation(token: string, userId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        projectId: string;
        expiresAt: Date;
    }>;
    getPendingInvitations(userId: string): Promise<({
        project: {
            name: string;
            id: string;
            color: string | null;
            icon: string | null;
        };
        inviter: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        projectId: string;
        expiresAt: Date;
    })[]>;
    getProjectMembers(projectId: string, userId: string): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        userId: string;
        projectId: string;
    })[]>;
    getProjectInvitations(projectId: string, userId: string): Promise<({
        inviter: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        projectId: string;
        expiresAt: Date;
    })[]>;
    updateMemberRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto, userId: string): Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        };
    } & {
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        userId: string;
        projectId: string;
    }>;
    removeMember(projectId: string, memberId: string, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        userId: string;
        projectId: string;
    }>;
    cancelInvitation(invitationId: string, userId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        projectId: string;
        expiresAt: Date;
    }>;
}
