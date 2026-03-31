import { NotFoundException } from '@nestjs/common'
import { TaskService } from './task.service'

describe('TaskService', () => {
  let service: TaskService
  let prismaMock: {
    task: {
      findUnique: jest.Mock
    }
  }
  let notificationServiceMock: {
    notifyTaskAssigned: jest.Mock
  }

  beforeEach(() => {
    prismaMock = {
      task: {
        findUnique: jest.fn(),
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
})
