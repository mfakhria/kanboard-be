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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
const notification_service_1 = require("../notification/notification.service");
let ProjectService = class ProjectService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async create(dto, userId) {
        await this.ensureWorkspaceMember(dto.workspaceId, userId);
        const project = await this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                color: dto.color,
                icon: dto.icon,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                picId: dto.picId,
                workspaceId: dto.workspaceId,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
                boards: {
                    create: {
                        name: 'Main Board',
                        columns: {
                            create: [
                                { name: 'To Do', position: 0, color: '#6366f1' },
                                { name: 'In Progress', position: 1, color: '#f59e0b' },
                                { name: 'Review', position: 2, color: '#3b82f6' },
                                { name: 'Done', position: 3, color: '#10b981' },
                            ],
                        },
                    },
                },
            },
            include: {
                labels: {
                    orderBy: { name: 'asc' },
                },
                pic: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                boards: {
                    include: {
                        columns: {
                            orderBy: { position: 'asc' },
                        },
                    },
                },
            },
        });
        const workspaceMembers = await this.prisma.workspaceMember.findMany({
            where: { workspaceId: dto.workspaceId },
            select: { userId: true },
        });
        const otherMembers = workspaceMembers
            .filter((m) => m.userId !== userId)
            .map((m) => ({
            userId: m.userId,
            projectId: project.id,
            role: 'MEMBER',
        }));
        if (otherMembers.length > 0) {
            await this.prisma.projectMember.createMany({
                data: otherMembers,
                skipDuplicates: true,
            });
        }
        await this.logActivity({
            action: client_1.ActivityAction.CREATED,
            entity: 'project',
            entityId: project.id,
            userId,
            projectId: project.id,
            metadata: {
                projectName: project.name,
                workspaceId: project.workspaceId,
            },
        });
        return project;
    }
    async findAllByWorkspace(workspaceId, userId) {
        const wsMember = await this.ensureWorkspaceMember(workspaceId, userId);
        const projects = await this.prisma.project.findMany({
            where: {
                workspaceId,
                OR: [
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' },
                ],
            },
            include: {
                labels: {
                    orderBy: { name: 'asc' },
                },
                pic: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                members: {
                    where: { userId },
                    select: { role: true },
                },
                boards: {
                    include: {
                        columns: {
                            include: {
                                _count: { select: { tasks: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return projects.map((p) => {
            const allColumns = p.boards.flatMap((b) => b.columns);
            const totalTasks = allColumns.reduce((sum, c) => sum + c._count.tasks, 0);
            const completedTasks = allColumns
                .filter((c) => {
                const name = c.name.toLowerCase();
                return name.includes('done') || name.includes('complete');
            })
                .reduce((sum, c) => sum + c._count.tasks, 0);
            const { members, ...restWithBoards } = p;
            const rest = { ...restWithBoards };
            delete rest.boards;
            const isWsAdmin = ['OWNER', 'ADMIN'].includes(wsMember.role);
            const myRole = members[0]?.role ?? (isWsAdmin ? 'ADMIN' : null);
            return { ...rest, totalTasks, completedTasks, myRole };
        });
    }
    async findById(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                labels: {
                    orderBy: { name: 'asc' },
                },
                pic: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                workspace: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, avatar: true },
                                },
                            },
                        },
                    },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true },
                        },
                    },
                },
                boards: {
                    include: {
                        columns: {
                            include: {
                                tasks: {
                                    include: {
                                        assignee: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                avatar: true,
                                            },
                                        },
                                        _count: {
                                            select: { comments: true },
                                        },
                                    },
                                    orderBy: { position: 'asc' },
                                },
                            },
                            orderBy: { position: 'asc' },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const isProjectMember = project.members.some((m) => m.userId === userId);
        const wsMember = project.workspace.members.find((m) => m.userId === userId);
        const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
        const isPublic = project.visibility === 'PUBLIC';
        if (!isProjectMember && !isWsAdmin && !(isPublic && wsMember)) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        return project;
    }
    async update(projectId, dto, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: { include: { members: true } },
                members: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const projectMember = project.members.find((m) => m.userId === userId);
        const wsMember = project.workspace.members.find((m) => m.userId === userId);
        const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
        const isProjectAdmin = projectMember && ['OWNER', 'ADMIN'].includes(projectMember.role);
        if (!isProjectAdmin && !isWsAdmin) {
            throw new common_1.ForbiddenException('You do not have permission to update this project');
        }
        const updated = await this.prisma.project.update({
            where: { id: projectId },
            data: {
                ...dto,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            },
            include: {
                pic: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'project',
            entityId: updated.id,
            userId,
            projectId: updated.id,
            metadata: {
                projectName: updated.name,
                changedFields: Object.keys(dto),
            },
        });
        return updated;
    }
    async delete(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: { include: { members: true } },
                members: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const projectMember = project.members.find((m) => m.userId === userId);
        const wsMember = project.workspace.members.find((m) => m.userId === userId);
        const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
        const isProjectOwner = projectMember && projectMember.role === 'OWNER';
        if (!isProjectOwner && !isWsAdmin) {
            throw new common_1.ForbiddenException('Only project owners or team admins can delete projects');
        }
        return this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    async ensureWorkspaceMember(workspaceId, userId) {
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
    async ensureProjectAdmin(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: { include: { members: true } },
                members: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const projectMember = project.members.find((m) => m.userId === userId);
        const wsMember = project.workspace.members.find((m) => m.userId === userId);
        const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
        const isProjectAdmin = projectMember && ['OWNER', 'ADMIN'].includes(projectMember.role);
        if (!isProjectAdmin && !isWsAdmin) {
            throw new common_1.ForbiddenException('You do not have permission to manage this project');
        }
        return project;
    }
    async inviteMember(projectId, dto, inviterId) {
        await this.ensureProjectAdmin(projectId, inviterId);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            const existingMember = await this.prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: existingUser.id, projectId } },
            });
            if (existingMember) {
                throw new common_1.BadRequestException('User is already a member of this project');
            }
        }
        const existingInvite = await this.prisma.projectInvitation.findFirst({
            where: { email: dto.email, projectId, status: 'PENDING' },
        });
        if (existingInvite) {
            throw new common_1.BadRequestException('An invitation is already pending for this email');
        }
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const invitation = await this.prisma.projectInvitation.create({
            data: {
                email: dto.email,
                token,
                role: dto.role ?? 'MEMBER',
                expiresAt,
                projectId,
                inviterId,
            },
            include: {
                project: { select: { id: true, name: true } },
                inviter: { select: { id: true, name: true, email: true } },
            },
        });
        if (existingUser) {
            await this.notificationService.notifyProjectInvitation({
                userId: existingUser.id,
                actorId: inviterId,
                projectId,
                projectName: invitation.project.name,
                invitationId: invitation.id,
                token,
                role: invitation.role,
            });
        }
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'project_invitation',
            entityId: invitation.id,
            userId: inviterId,
            projectId,
            metadata: {
                projectName: invitation.project.name,
                invitedEmail: invitation.email,
                role: invitation.role,
            },
        });
        return invitation;
    }
    async acceptInvitation(token, userId) {
        const invitation = await this.prisma.projectInvitation.findUnique({
            where: { token },
            include: {
                project: { select: { id: true, name: true, workspaceId: true } },
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.status !== 'PENDING') {
            throw new common_1.BadRequestException('This invitation has already been processed');
        }
        if (invitation.expiresAt < new Date()) {
            await this.prisma.projectInvitation.update({
                where: { id: invitation.id },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('This invitation has expired');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.email !== invitation.email) {
            throw new common_1.ForbiddenException('This invitation was sent to a different email address');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.projectInvitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED' },
            });
            const wsId = invitation.project.workspaceId;
            const wsMember = await tx.workspaceMember.findUnique({
                where: { userId_workspaceId: { userId, workspaceId: wsId } },
            });
            if (!wsMember) {
                await tx.workspaceMember.create({
                    data: { userId, workspaceId: wsId, role: 'MEMBER' },
                });
            }
            const member = await tx.projectMember.create({
                data: {
                    userId,
                    projectId: invitation.projectId,
                    role: invitation.role,
                },
                include: {
                    project: { select: { id: true, name: true, workspaceId: true } },
                    user: { select: { id: true, name: true, email: true, avatar: true } },
                },
            });
            await tx.activityLog.create({
                data: {
                    action: client_1.ActivityAction.UPDATED,
                    entity: 'project_member',
                    entityId: member.id,
                    userId,
                    projectId: invitation.projectId,
                    metadata: {
                        projectName: invitation.project.name,
                        role: invitation.role,
                        invitedEmail: invitation.email,
                        status: 'ACCEPTED',
                    },
                },
            });
            return member;
        });
    }
    async declineInvitation(token, userId) {
        const invitation = await this.prisma.projectInvitation.findUnique({
            where: { token },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.email !== invitation.email) {
            throw new common_1.ForbiddenException('This invitation was sent to a different email address');
        }
        return this.prisma.projectInvitation.update({
            where: { id: invitation.id },
            data: { status: 'DECLINED' },
        });
    }
    async getPendingInvitations(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.projectInvitation.findMany({
            where: { email: user.email, status: 'PENDING', expiresAt: { gt: new Date() } },
            include: {
                project: { select: { id: true, name: true, icon: true, color: true } },
                inviter: { select: { id: true, name: true, email: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProjectMembers(projectId, userId) {
        await this.findById(projectId, userId);
        return this.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
    }
    async getProjectInvitations(projectId, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        return this.prisma.projectInvitation.findMany({
            where: { projectId, status: 'PENDING' },
            include: {
                inviter: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateMemberRole(projectId, memberId, dto, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        const member = await this.prisma.projectMember.findUnique({
            where: { id: memberId, projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found');
        }
        if (member.role === 'OWNER') {
            const currentMember = await this.prisma.projectMember.findUnique({
                where: { userId_projectId: { userId, projectId } },
            });
            if (!currentMember || currentMember.role !== 'OWNER') {
                throw new common_1.ForbiddenException('Only project owners can change another owner\'s role');
            }
        }
        const updatedMember = await this.prisma.projectMember.update({
            where: { id: memberId },
            data: { role: dto.role },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'project_member',
            entityId: updatedMember.id,
            userId,
            projectId,
            metadata: {
                memberName: updatedMember.user.name,
                memberEmail: updatedMember.user.email,
                previousRole: member.role,
                role: dto.role,
            },
        });
        return updatedMember;
    }
    async removeMember(projectId, memberId, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        const member = await this.prisma.projectMember.findUnique({
            where: { id: memberId, projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
            },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found');
        }
        if (member.role === 'OWNER') {
            throw new common_1.ForbiddenException('Cannot remove the project owner');
        }
        const removedMember = await this.prisma.projectMember.delete({
            where: { id: memberId },
        });
        await this.logActivity({
            action: client_1.ActivityAction.DELETED,
            entity: 'project_member',
            entityId: removedMember.id,
            userId,
            projectId,
            metadata: {
                memberName: member.user.name,
                memberEmail: member.user.email,
                removedUserId: removedMember.userId,
                role: removedMember.role,
            },
        });
        return removedMember;
    }
    async cancelInvitation(invitationId, userId) {
        const invitation = await this.prisma.projectInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        await this.ensureProjectAdmin(invitation.projectId, userId);
        return this.prisma.projectInvitation.delete({
            where: { id: invitationId },
        });
    }
    async getProjectLabels(projectId, userId) {
        await this.findById(projectId, userId);
        return this.prisma.projectLabel.findMany({
            where: { projectId },
            orderBy: { name: 'asc' },
        });
    }
    async createProjectLabel(projectId, dto, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        const name = dto.name.trim();
        const existing = await this.prisma.projectLabel.findFirst({
            where: {
                projectId,
                name: { equals: name, mode: 'insensitive' },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('A label with this name already exists in the project');
        }
        const label = await this.prisma.projectLabel.create({
            data: {
                projectId,
                name,
                color: dto.color ?? '#6366f1',
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.CREATED,
            entity: 'project_label',
            entityId: label.id,
            userId,
            projectId,
            metadata: {
                labelName: label.name,
                color: label.color,
            },
        });
        return label;
    }
    async updateProjectLabel(projectId, labelId, dto, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        const existingLabel = await this.prisma.projectLabel.findFirst({
            where: { id: labelId, projectId },
        });
        if (!existingLabel) {
            throw new common_1.NotFoundException('Project label not found');
        }
        const nextName = dto.name?.trim();
        if (nextName && nextName.toLowerCase() !== existingLabel.name.toLowerCase()) {
            const duplicate = await this.prisma.projectLabel.findFirst({
                where: {
                    projectId,
                    name: { equals: nextName, mode: 'insensitive' },
                    NOT: { id: labelId },
                },
            });
            if (duplicate) {
                throw new common_1.BadRequestException('A label with this name already exists in the project');
            }
        }
        const updatedLabel = await this.prisma.projectLabel.update({
            where: { id: labelId },
            data: {
                name: nextName,
                color: dto.color,
            },
        });
        await this.logActivity({
            action: client_1.ActivityAction.UPDATED,
            entity: 'project_label',
            entityId: updatedLabel.id,
            userId,
            projectId,
            metadata: {
                labelName: updatedLabel.name,
                color: updatedLabel.color,
                previousName: existingLabel.name,
                previousColor: existingLabel.color,
                changedFields: Object.keys(dto),
            },
        });
        return updatedLabel;
    }
    async deleteProjectLabel(projectId, labelId, userId) {
        await this.ensureProjectAdmin(projectId, userId);
        const label = await this.prisma.projectLabel.findFirst({
            where: { id: labelId, projectId },
        });
        if (!label) {
            throw new common_1.NotFoundException('Project label not found');
        }
        const deletedLabel = await this.prisma.projectLabel.delete({
            where: { id: labelId },
        });
        await this.logActivity({
            action: client_1.ActivityAction.DELETED,
            entity: 'project_label',
            entityId: deletedLabel.id,
            userId,
            projectId,
            metadata: {
                labelName: deletedLabel.name,
                color: deletedLabel.color,
            },
        });
        return deletedLabel;
    }
    async logActivity(params) {
        await this.prisma.activityLog.create({
            data: {
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                userId: params.userId,
                projectId: params.projectId,
                metadata: params.metadata,
            },
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], ProjectService);
//# sourceMappingURL=project.service.js.map