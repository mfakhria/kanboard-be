"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let WorkspaceService = class WorkspaceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const slug = this.generateSlug(dto.name);
        const workspace = await this.prisma.workspace.create({
            data: {
                name: dto.name,
                description: dto.description,
                slug,
                members: {
                    create: {
                        userId,
                        role: client_1.WorkspaceRole.OWNER,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        return workspace;
    }
    async findAllByUser(userId) {
        return this.prisma.workspace.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { projects: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(workspaceId, userId) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        if (!workspace) {
            throw new common_1.NotFoundException('Team not found');
        }
        const member = workspace.members.find((m) => m.userId === userId);
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        const projects = await this.prisma.project.findMany({
            where: {
                workspaceId,
                OR: [
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return { ...workspace, projects };
    }
    async update(workspaceId, dto, userId) {
        await this.ensureRole(workspaceId, userId, [
            client_1.WorkspaceRole.OWNER,
            client_1.WorkspaceRole.ADMIN,
        ], 'Anda tidak dapat mengedit workspace milik user lain.');
        const data = {};
        if (typeof dto.name === 'string') {
            const trimmed = dto.name.trim();
            if (trimmed.length > 0) {
                data.name = trimmed;
            }
        }
        if (typeof dto.description === 'string') {
            const trimmed = dto.description.trim();
            data.description = trimmed.length > 0 ? trimmed : null;
        }
        return this.prisma.workspace.update({
            where: { id: workspaceId },
            data,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async inviteMember(workspaceId, dto, inviterId) {
        await this.ensureRole(workspaceId, inviterId, [
            client_1.WorkspaceRole.OWNER,
            client_1.WorkspaceRole.ADMIN,
        ]);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User with this email not found');
        }
        if (user.id === inviterId) {
            throw new common_1.BadRequestException('You cannot invite yourself');
        }
        const existingMember = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.ConflictException('User is already a member of this team');
        }
        const existingInvite = await this.prisma.workspaceInvitation.findFirst({
            where: {
                workspaceId,
                inviteeId: user.id,
                status: client_1.WorkspaceInvitationStatus.PENDING,
            },
        });
        if (existingInvite) {
            throw new common_1.ConflictException('An invitation is already pending for this user');
        }
        return this.prisma.workspaceInvitation.create({
            data: {
                workspaceId,
                inviterId,
                inviteeId: user.id,
                role: dto.role || client_1.WorkspaceRole.MEMBER,
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                invitee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async getPendingInvitations(userId) {
        return this.prisma.workspaceInvitation.findMany({
            where: {
                inviteeId: userId,
                status: client_1.WorkspaceInvitationStatus.PENDING,
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async acceptInvitation(invitationId, userId) {
        const invitation = await this.prisma.workspaceInvitation.findUnique({
            where: { id: invitationId },
            include: {
                workspace: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.inviteeId !== userId) {
            throw new common_1.ForbiddenException('This invitation is not for you');
        }
        if (invitation.status !== client_1.WorkspaceInvitationStatus.PENDING) {
            throw new common_1.BadRequestException('This invitation has already been processed');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.workspaceInvitation.update({
                where: { id: invitation.id },
                data: {
                    status: client_1.WorkspaceInvitationStatus.ACCEPTED,
                    respondedAt: new Date(),
                },
            });
            const member = await tx.workspaceMember.upsert({
                where: {
                    userId_workspaceId: {
                        userId,
                        workspaceId: invitation.workspaceId,
                    },
                },
                update: {},
                create: {
                    userId,
                    workspaceId: invitation.workspaceId,
                    role: invitation.role,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            });
            const projects = await tx.project.findMany({
                where: { workspaceId: invitation.workspaceId },
                select: { id: true },
            });
            if (projects.length > 0) {
                await tx.projectMember.createMany({
                    data: projects.map((p) => ({
                        userId,
                        projectId: p.id,
                        role: 'MEMBER',
                    })),
                    skipDuplicates: true,
                });
            }
            return member;
        });
    }
    async declineInvitation(invitationId, userId) {
        const invitation = await this.prisma.workspaceInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.inviteeId !== userId) {
            throw new common_1.ForbiddenException('This invitation is not for you');
        }
        if (invitation.status !== client_1.WorkspaceInvitationStatus.PENDING) {
            throw new common_1.BadRequestException('This invitation has already been processed');
        }
        return this.prisma.workspaceInvitation.update({
            where: { id: invitation.id },
            data: {
                status: client_1.WorkspaceInvitationStatus.DECLINED,
                respondedAt: new Date(),
            },
        });
    }
    async listMembers(workspaceId, userId) {
        await this.ensureMember(workspaceId, userId);
        return this.prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
    }
    async assignRole(workspaceId, memberId, dto, assignerId) {
        await this.ensureRole(workspaceId, assignerId, [client_1.WorkspaceRole.OWNER]);
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id: memberId, workspaceId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found in this team');
        }
        return this.prisma.workspaceMember.update({
            where: { id: memberId },
            data: { role: dto.role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
    }
    async removeMember(workspaceId, memberId, removerId) {
        await this.ensureRole(workspaceId, removerId, [
            client_1.WorkspaceRole.OWNER,
            client_1.WorkspaceRole.ADMIN,
        ]);
        const member = await this.prisma.workspaceMember.findFirst({
            where: { id: memberId, workspaceId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found in this team');
        }
        if (member.role === client_1.WorkspaceRole.OWNER) {
            throw new common_1.ForbiddenException('Cannot remove the team owner');
        }
        await this.prisma.projectMember.deleteMany({
            where: {
                userId: member.userId,
                project: { workspaceId },
            },
        });
        await this.prisma.workspaceMember.delete({
            where: { id: memberId },
        });
        return { message: 'Member removed successfully' };
    }
    async delete(workspaceId, userId) {
        await this.ensureRole(workspaceId, userId, [client_1.WorkspaceRole.OWNER]);
        return this.prisma.workspace.delete({
            where: { id: workspaceId },
        });
    }
    async ensureMember(workspaceId, userId) {
        const member = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: { userId, workspaceId },
            },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this team');
        }
        return member;
    }
    async ensureRole(workspaceId, userId, roles, forbiddenMessage = 'Insufficient permissions') {
        const member = await this.ensureMember(workspaceId, userId);
        if (!roles.includes(member.role)) {
            throw new common_1.ForbiddenException(forbiddenMessage);
        }
        return member;
    }
    generateSlug(name) {
        return (name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') +
            '-' +
            Date.now().toString(36));
    }
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map