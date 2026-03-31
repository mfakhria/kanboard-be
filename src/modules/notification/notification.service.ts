import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto';

interface CreateNotificationInput {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    await this.ensurePreferences(userId);

    return this.prisma.notification.findMany({
      where: { userId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true, readAt: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    if (notification.readAt) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  async getPreferences(userId: string) {
    return this.ensurePreferences(userId);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    await this.ensurePreferences(userId);

    return this.prisma.notificationPreference.update({
      where: { userId },
      data: dto,
    });
  }

  async createNotification(input: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        actorId: input.actorId ?? undefined,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata,
      },
    });
  }

  async notifyWorkspaceInvitation(params: {
    userId: string;
    actorId: string;
    workspaceId: string;
    workspaceName: string;
    invitationId: string;
    role: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      actorId: params.actorId,
      type: NotificationType.WORKSPACE_INVITATION,
      title: `Team invitation: ${params.workspaceName}`,
      message: `You were invited to join ${params.workspaceName} as ${params.role}.`,
      metadata: {
        workspaceId: params.workspaceId,
        workspaceName: params.workspaceName,
        workspaceInvitationId: params.invitationId,
        role: params.role,
      },
    });
  }

  async notifyProjectInvitation(params: {
    userId: string;
    actorId: string;
    projectId: string;
    projectName: string;
    invitationId: string;
    token: string;
    role: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      actorId: params.actorId,
      type: NotificationType.PROJECT_INVITATION,
      title: `Project invitation: ${params.projectName}`,
      message: `You were invited to join ${params.projectName} as ${params.role}.`,
      metadata: {
        projectId: params.projectId,
        projectName: params.projectName,
        projectInvitationId: params.invitationId,
        projectInvitationToken: params.token,
        role: params.role,
      },
    });
  }

  async notifyTaskAssigned(params: {
    userId: string;
    actorId: string;
    taskId: string;
    taskTitle: string;
    projectId?: string | null;
    projectName?: string | null;
  }) {
    const preferences = await this.ensurePreferences(params.userId);
    if (!preferences.taskAssigned) {
      return null;
    }

    return this.createNotification({
      userId: params.userId,
      actorId: params.actorId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'Task assigned to you',
      message: `You were assigned to "${params.taskTitle}".`,
      metadata: {
        taskId: params.taskId,
        taskTitle: params.taskTitle,
        projectId: params.projectId,
        projectName: params.projectName,
      },
    });
  }

  async notifyTaskReviewSubmitted(params: {
    userId: string;
    actorId: string;
    taskId: string;
    taskTitle: string;
    projectId?: string | null;
    projectName?: string | null;
    reviewDueDate?: Date | null;
  }) {
    return this.createNotification({
      userId: params.userId,
      actorId: params.actorId,
      type: NotificationType.GENERAL,
      title: 'Task submitted for review',
      message: `A review was requested for "${params.taskTitle}".`,
      metadata: {
        taskId: params.taskId,
        taskTitle: params.taskTitle,
        projectId: params.projectId,
        projectName: params.projectName,
        reviewDueDate: params.reviewDueDate?.toISOString() ?? null,
        reviewAction: 'SUBMITTED',
      },
    });
  }

  async notifyTaskReviewDecision(params: {
    userId: string;
    actorId: string;
    taskId: string;
    taskTitle: string;
    projectId?: string | null;
    projectName?: string | null;
    decision: 'APPROVED' | 'CHANGES_REQUESTED';
    comment?: string | null;
  }) {
    const title = params.decision === 'APPROVED'
      ? 'Task approved'
      : 'Changes requested on task';

    const message = params.decision === 'APPROVED'
      ? `Your task "${params.taskTitle}" has been approved.`
      : `Changes were requested for "${params.taskTitle}".`;

    return this.createNotification({
      userId: params.userId,
      actorId: params.actorId,
      type: NotificationType.GENERAL,
      title,
      message,
      metadata: {
        taskId: params.taskId,
        taskTitle: params.taskTitle,
        projectId: params.projectId,
        projectName: params.projectName,
        reviewAction: params.decision,
        reviewComment: params.comment ?? null,
      },
    });
  }

  private async ensurePreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }
}
