import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  let service: NotificationService
  let prismaMock: {
    notification: {
      findUnique: jest.Mock
      update: jest.Mock
      create: jest.Mock
    }
    notificationPreference: {
      upsert: jest.Mock
    }
  }

  beforeEach(() => {
    prismaMock = {
      notification: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      notificationPreference: {
        upsert: jest.fn(),
      },
    }

    service = new NotificationService(prismaMock as any)
  })

  it('should throw NotFoundException when marking a missing notification as read', async () => {
    prismaMock.notification.findUnique.mockResolvedValue(null)

    await expect(service.markAsRead('missing-id', 'user-1')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should throw ForbiddenException when notification belongs to another user', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      id: 'notif-1',
      userId: 'other-user',
      readAt: null,
    })

    await expect(service.markAsRead('notif-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('should update readAt when marking an unread notification as read', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      readAt: null,
    })
    prismaMock.notification.update.mockResolvedValue({
      id: 'notif-1',
      readAt: '2026-03-31T10:00:00.000Z',
    })

    const result = await service.markAsRead('notif-1', 'user-1')

    expect(prismaMock.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: { readAt: expect.any(Date) },
    })
    expect(result).toEqual({
      id: 'notif-1',
      readAt: '2026-03-31T10:00:00.000Z',
    })
  })

  it('should not create task assignment notifications when preference is disabled', async () => {
    prismaMock.notificationPreference.upsert.mockResolvedValue({
      userId: 'user-1',
      taskAssigned: false,
    })

    const result = await service.notifyTaskAssigned({
      userId: 'user-1',
      actorId: 'actor-1',
      taskId: 'task-1',
      taskTitle: 'Write docs',
    })

    expect(result).toBeNull()
    expect(prismaMock.notification.create).not.toHaveBeenCalled()
  })

  it('should create task assignment notifications when preference is enabled', async () => {
    prismaMock.notificationPreference.upsert.mockResolvedValue({
      userId: 'user-1',
      taskAssigned: true,
    })
    prismaMock.notification.create.mockResolvedValue({
      id: 'notif-1',
      type: NotificationType.TASK_ASSIGNED,
    })

    const result = await service.notifyTaskAssigned({
      userId: 'user-1',
      actorId: 'actor-1',
      taskId: 'task-1',
      taskTitle: 'Write docs',
      projectId: 'project-1',
      projectName: 'Kanzon',
    })

    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        actorId: 'actor-1',
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task assigned to you',
        message: 'You were assigned to "Write docs".',
        metadata: {
          taskId: 'task-1',
          taskTitle: 'Write docs',
          projectId: 'project-1',
          projectName: 'Kanzon',
        },
      },
    })
    expect(result).toEqual({
      id: 'notif-1',
      type: NotificationType.TASK_ASSIGNED,
    })
  })
})
