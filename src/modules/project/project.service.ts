import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, InviteToProjectDto, UpdateMemberRoleDto } from './dto';
import { randomUUID } from 'crypto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    // Verify user is a member of the workspace
    await this.ensureWorkspaceMember(dto.workspaceId, userId);

    // Create project with a default board, default columns, and creator as OWNER
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

    // Auto-add all other team members to the new project
    const workspaceMembers = await this.prisma.workspaceMember.findMany({
      where: { workspaceId: dto.workspaceId },
      select: { userId: true },
    });

    const otherMembers = workspaceMembers
      .filter((m) => m.userId !== userId)
      .map((m) => ({
        userId: m.userId,
        projectId: project.id,
        role: 'MEMBER' as const,
      }));

    if (otherMembers.length > 0) {
      await this.prisma.projectMember.createMany({
        data: otherMembers,
        skipDuplicates: true,
      });
    }

    await this.logActivity({
      action: ActivityAction.CREATED,
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

  async findAllByWorkspace(workspaceId: string, userId: string) {
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
      const rest: typeof restWithBoards = { ...restWithBoards };
      delete (rest as Partial<typeof restWithBoards>).boards;
      const isWsAdmin = ['OWNER', 'ADMIN'].includes(wsMember.role);
      const myRole = members[0]?.role ?? (isWsAdmin ? 'ADMIN' : null);
      return { ...rest, totalTasks, completedTasks, myRole };
    });
  }

  async findById(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
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
      throw new NotFoundException('Project not found');
    }

    // Allow if user is a project member, workspace OWNER/ADMIN, or project is PUBLIC
    const isProjectMember = project.members.some((m) => m.userId === userId);
    const wsMember = project.workspace.members.find((m) => m.userId === userId);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isPublic = project.visibility === 'PUBLIC';

    if (!isProjectMember && !isWsAdmin && !(isPublic && wsMember)) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(projectId: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: { include: { members: true } },
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Allow project OWNER/ADMIN or workspace OWNER/ADMIN
    const projectMember = project.members.find((m) => m.userId === userId);
    const wsMember = project.workspace.members.find((m) => m.userId === userId);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isProjectAdmin = projectMember && ['OWNER', 'ADMIN'].includes(projectMember.role);

    if (!isProjectAdmin && !isWsAdmin) {
      throw new ForbiddenException('You do not have permission to update this project');
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
      action: ActivityAction.UPDATED,
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

  async delete(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: { include: { members: true } },
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Allow project OWNER or workspace OWNER/ADMIN
    const projectMember = project.members.find((m) => m.userId === userId);
    const wsMember = project.workspace.members.find((m) => m.userId === userId);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isProjectOwner = projectMember && projectMember.role === 'OWNER';

    if (!isProjectOwner && !isWsAdmin) {
      throw new ForbiddenException('Only project owners or team admins can delete projects');
    }

    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async ensureWorkspaceMember(workspaceId: string, userId: string) {
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

  private async ensureProjectAdmin(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: { include: { members: true } },
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const projectMember = project.members.find((m) => m.userId === userId);
    const wsMember = project.workspace.members.find((m) => m.userId === userId);
    const isWsAdmin = wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role);
    const isProjectAdmin = projectMember && ['OWNER', 'ADMIN'].includes(projectMember.role);

    if (!isProjectAdmin && !isWsAdmin) {
      throw new ForbiddenException('You do not have permission to manage this project');
    }

    return project;
  }

  // ─── Invite & Members ──────────────────────────────────────────────────────

  async inviteMember(projectId: string, dto: InviteToProjectDto, inviterId: string) {
    await this.ensureProjectAdmin(projectId, inviterId);

    // Check if user is already a member
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      const existingMember = await this.prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: existingUser.id, projectId } },
      });
      if (existingMember) {
        throw new BadRequestException('User is already a member of this project');
      }
    }

    // Check for pending invitation
    const existingInvite = await this.prisma.projectInvitation.findFirst({
      where: { email: dto.email, projectId, status: 'PENDING' },
    });
    if (existingInvite) {
      throw new BadRequestException('An invitation is already pending for this email');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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
      action: ActivityAction.UPDATED,
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

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        project: { select: { id: true, name: true, workspaceId: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('This invitation has already been processed');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('This invitation has expired');
    }

    // Verify the accepting user's email matches the invitation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    // Use transaction to update invitation + create member + ensure workspace membership
    return this.prisma.$transaction(async (tx) => {
      await tx.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      // Ensure user is a workspace member
      const wsId = invitation.project.workspaceId;
      const wsMember = await tx.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId: wsId } },
      });
      if (!wsMember) {
        await tx.workspaceMember.create({
          data: { userId, workspaceId: wsId, role: 'MEMBER' },
        });
      }

      // Add as project member
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
          action: ActivityAction.UPDATED,
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

  async declineInvitation(token: string, userId: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify the user's email matches
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    return this.prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: { status: 'DECLINED' },
    });
  }

  async getPendingInvitations(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

  async getProjectMembers(projectId: string, userId: string) {
    // Verify access (project member or ws admin)
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

  async getProjectInvitations(projectId: string, userId: string) {
    await this.ensureProjectAdmin(projectId, userId);

    return this.prisma.projectInvitation.findMany({
      where: { projectId, status: 'PENDING' },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMemberRole(projectId: string, memberId: string, dto: UpdateMemberRoleDto, userId: string) {
    await this.ensureProjectAdmin(projectId, userId);

    const member = await this.prisma.projectMember.findUnique({
      where: { id: memberId, projectId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Cannot change the role of the project OWNER unless you're also an OWNER
    if (member.role === 'OWNER') {
      const currentMember = await this.prisma.projectMember.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });
      if (!currentMember || currentMember.role !== 'OWNER') {
        throw new ForbiddenException('Only project owners can change another owner\'s role');
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
      action: ActivityAction.UPDATED,
      entity: 'project_member',
      entityId: updatedMember.id,
      userId,
      projectId,
      metadata: {
        memberName: updatedMember.user.name,
        memberEmail: updatedMember.user.email,
        role: dto.role,
      },
    });

    return updatedMember;
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.ensureProjectAdmin(projectId, userId);

    const member = await this.prisma.projectMember.findUnique({
      where: { id: memberId, projectId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove the project OWNER
    if (member.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove the project owner');
    }

    const removedMember = await this.prisma.projectMember.delete({
      where: { id: memberId },
    });

    await this.logActivity({
      action: ActivityAction.DELETED,
      entity: 'project_member',
      entityId: removedMember.id,
      userId,
      projectId,
      metadata: {
        removedUserId: removedMember.userId,
        role: removedMember.role,
      },
    });

    return removedMember;
  }

  async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.ensureProjectAdmin(invitation.projectId, userId);

    return this.prisma.projectInvitation.delete({
      where: { id: invitationId },
    });
  }

  private async logActivity(params: {
    action: ActivityAction;
    entity: string;
    entityId: string;
    userId: string;
    projectId?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.activityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
        projectId: params.projectId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
