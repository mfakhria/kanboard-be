import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { WorkspaceRole, WorkspaceInvitationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteMemberDto,
  AssignRoleDto,
} from './dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateWorkspaceDto, userId: string) {
    const slug = this.generateSlug(dto.name);

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
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

  async findAllByUser(userId: string) {
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

  async findById(workspaceId: string, userId: string) {
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
      throw new NotFoundException('Team not found');
    }

    const member = workspace.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
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

  async update(workspaceId: string, dto: UpdateWorkspaceDto, userId: string) {
    await this.ensureRole(workspaceId, userId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ], 'You cannot edit another user\'s workspace.');

    const data: { name?: string; description?: string | null } = {};

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

  async inviteMember(workspaceId: string, dto: InviteMemberDto, inviterId: string) {
    await this.ensureRole(workspaceId, inviterId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    if (user.id === inviterId) {
      throw new BadRequestException('You cannot invite yourself');
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
      throw new ConflictException('User is already a member of this team');
    }

    const existingInvite = await this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        inviteeId: user.id,
        status: WorkspaceInvitationStatus.PENDING,
      },
    });

    if (existingInvite) {
      throw new ConflictException('An invitation is already pending for this user');
    }

    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        inviterId,
        inviteeId: user.id,
        role: dto.role || WorkspaceRole.MEMBER,
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

    await this.notificationService.notifyWorkspaceInvitation({
      userId: user.id,
      actorId: inviterId,
      workspaceId,
      workspaceName: invitation.workspace.name,
      invitationId: invitation.id,
      role: invitation.role,
    });

    return invitation;
  }

  async getPendingInvitations(userId: string) {
    return this.prisma.workspaceInvitation.findMany({
      where: {
        inviteeId: userId,
        status: WorkspaceInvitationStatus.PENDING,
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

  async acceptInvitation(invitationId: string, userId: string) {
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
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: {
          status: WorkspaceInvitationStatus.ACCEPTED,
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
            role: 'MEMBER' as const,
          })),
          skipDuplicates: true,
        });
      }

      return member;
    });
  }

  async declineInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been processed');
    }

    return this.prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        status: WorkspaceInvitationStatus.DECLINED,
        respondedAt: new Date(),
      },
    });
  }

  async listMembers(workspaceId: string, userId: string) {
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

  async assignRole(
    workspaceId: string,
    memberId: string,
    dto: AssignRoleDto,
    assignerId: string,
  ) {
    await this.ensureRole(workspaceId, assignerId, [WorkspaceRole.OWNER]);

    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this team');
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

  async removeMember(workspaceId: string, memberId: string, removerId: string) {
    await this.ensureRole(workspaceId, removerId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const member = await this.prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this team');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot remove the team owner');
    }

    // Cascade: remove from all projects in this team
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

  async delete(workspaceId: string, userId: string) {
    await this.ensureRole(workspaceId, userId, [WorkspaceRole.OWNER]);

    return this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async ensureMember(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return member;
  }

  private async ensureRole(
    workspaceId: string,
    userId: string,
    roles: WorkspaceRole[],
    forbiddenMessage = 'Insufficient permissions',
  ) {
    const member = await this.ensureMember(workspaceId, userId);

    if (!roles.includes(member.role)) {
      throw new ForbiddenException(forbiddenMessage);
    }

    return member;
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36)
    );
  }
}
