import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, InviteMemberDto, AssignRoleDto } from './dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

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
        projects: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
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

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    return this.prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role: dto.role || WorkspaceRole.MEMBER,
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
      throw new NotFoundException('Member not found in this workspace');
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
      throw new NotFoundException('Member not found in this workspace');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

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
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }

  private async ensureRole(
    workspaceId: string,
    userId: string,
    roles: WorkspaceRole[],
  ) {
    const member = await this.ensureMember(workspaceId, userId);

    if (!roles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
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
