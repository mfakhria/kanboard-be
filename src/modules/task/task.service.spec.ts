import { NotFoundException } from '@nestjs/common'
import { TaskService } from './task.service'

describe('TaskService', () => {
  let service: TaskService
  let prismaMock: {
    task: {
      findUnique: jest.Mock
      update: jest.Mock
    }
    activityLog: {
      create: jest.Mock
    }
  }
  let notificationServiceMock: {
    notifyTaskAssigned: jest.Mock
  }

  beforeEach(() => {
    prismaMock = {
      task: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
    }

    notificationServiceMock = {
      notifyTaskAssigned: jest.fn(),
    }

    service = new TaskService(prismaMock as any, notificationServiceMock as any)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should throw NotFoundException when task is missing', async () => {
    prismaMock.task.findUnique.mockResolvedValue(null)

    await expect(service.findById('missing-task-id')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('replaces task labels when labels are provided on update', async () => {
    prismaMock.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task',
      completed: false,
      column: {
        board: {
          project: {
            id: 'project-1',
            name: 'Demo Project',
          },
        },
      },
    })

    prismaMock.task.update.mockResolvedValue({
      id: 'task-1',
      title: 'Task',
      labels: [
        { id: 'label-1', name: 'Backend', color: '#478FC8' },
      ],
      _count: { comments: 0 },
    })

    await service.update('task-1', {
      labels: [
        { name: ' Backend ', color: '#478FC8' },
        { name: 'Blocked' },
      ],
    } as any, 'user-1')

    expect(prismaMock.task.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'task-1' },
      data: expect.objectContaining({
        labels: {
          deleteMany: {},
          create: [
            { name: 'Backend', color: '#478FC8' },
            { name: 'Blocked', color: '#6366f1' },
          ],
        },
      }),
    }))
    expect(prismaMock.activityLog.create).toHaveBeenCalled()
  })
})
