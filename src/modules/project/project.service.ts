import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    // Verify user is a member of the workspace
    await this.ensureWorkspaceMember(dto.workspaceId, userId);

    // Create project with a default board and default columns
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        picId: dto.picId,
        workspaceId: dto.workspaceId,
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

    return project;
  }

  async findAllByWorkspace(workspaceId: string, userId: string) {
    await this.ensureWorkspaceMember(workspaceId, userId);

    return this.prisma.project.findMany({
      where: { workspaceId },
      include: {
        pic: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            boards: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

    const isMember = project.workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(projectId: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.project.update({
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
  }

  async delete(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = project.workspace.members.find((m) => m.userId === userId);
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new ForbiddenException('Only workspace owners/admins can delete projects');
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
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }
}
