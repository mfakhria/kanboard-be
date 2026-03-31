import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, InviteToProjectDto, AcceptInvitationDto, UpdateMemberRoleDto, CreateProjectLabelDto, UpdateProjectLabelDto } from './dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
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
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            color: string;
        }[];
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
    findAll(workspaceId: string, userId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        myRole: import(".prisma/client").$Enums.ProjectRole;
        pic: {
            name: string;
            email: string;
            id: string;
            avatar: string | null;
        } | null;
        boards: ({
            columns: ({
                _count: {
                    tasks: number;
                };
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
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            color: string;
        }[];
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
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        expiresAt: Date;
    })[]>;
    acceptInvitation(dto: AcceptInvitationDto, userId: string): Promise<{
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
    declineInvitation(dto: AcceptInvitationDto, userId: string): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.ProjectRole;
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        expiresAt: Date;
    }>;
    findOne(projectId: string, userId: string): Promise<{
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
                    title: string;
                    reviewDueDate: Date | null;
                    dueDate: Date | null;
                    position: number;
                    priority: import(".prisma/client").$Enums.TaskPriority;
                    completed: boolean;
                    approvalStatus: import(".prisma/client").$Enums.TaskApprovalStatus;
                    reviewSubmittedAt: Date | null;
                    columnId: string;
                    assigneeId: string | null;
                    creatorId: string;
                    reviewerId: string | null;
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
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            color: string;
        }[];
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
    inviteMember(projectId: string, dto: InviteToProjectDto, userId: string): Promise<{
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
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        expiresAt: Date;
    }>;
    getMembers(projectId: string, userId: string): Promise<({
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
    getInvitations(projectId: string, userId: string): Promise<({
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
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
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
        projectId: string;
        status: import(".prisma/client").$Enums.InvitationStatus;
        inviterId: string;
        token: string;
        expiresAt: Date;
    }>;
    getLabels(projectId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        color: string;
    }[]>;
    createLabel(projectId: string, dto: CreateProjectLabelDto, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        color: string;
    }>;
    updateLabel(projectId: string, labelId: string, dto: UpdateProjectLabelDto, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        color: string;
    }>;
    deleteLabel(projectId: string, labelId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        color: string;
    }>;
}
