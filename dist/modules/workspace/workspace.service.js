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
                projects: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        const isMember = workspace.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this workspace');
        }
        return workspace;
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
        const existingMember = await this.prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: user.id,
                    workspaceId,
                },
            },
        });
        if (existingMember) {
            throw new common_1.ConflictException('User is already a member of this workspace');
        }
        return this.prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role: dto.role || client_1.WorkspaceRole.MEMBER,
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
            throw new common_1.NotFoundException('Member not found in this workspace');
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
            throw new common_1.NotFoundException('Member not found in this workspace');
        }
        if (member.role === client_1.WorkspaceRole.OWNER) {
            throw new common_1.ForbiddenException('Cannot remove the workspace owner');
        }
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
            throw new common_1.ForbiddenException('You are not a member of this workspace');
        }
        return member;
    }
    async ensureRole(workspaceId, userId, roles) {
        const member = await this.ensureMember(workspaceId, userId);
        if (!roles.includes(member.role)) {
            throw new common_1.ForbiddenException('Insufficient permissions');
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