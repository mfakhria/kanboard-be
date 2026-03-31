import { BadRequestException, NotFoundException } from '@nestjs/common'
import { TaskApprovalStatus, TaskReviewAction } from '@prisma/client'
import { TaskService } from './task.service'

describe('TaskService', () => {
  let service: TaskService
  let prismaMock: {
    task: {
      findUnique: jest.Mock
      update: jest.Mock
    }
    taskReview: {
      create: jest.Mock
    }
    activityLog: {
      create: jest.Mock
    }
  }
  let notificationServiceMock: {
    notifyTaskAssigned: jest.Mock
    notifyTaskReviewSubmitted: jest.Mock
    notifyTaskReviewDecision: jest.Mock
  }

  beforeEach(() => {
    prismaMock = {
      task: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      taskReview: {
        create: jest.fn(),
      },
      activityLog: {
        create: jest.fn(),
      },
    }

    notificationServiceMock = {
      notifyTaskAssigned: jest.fn(),
      notifyTaskReviewSubmitted: jest.fn(),
      notifyTaskReviewDecision: jest.fn(),
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

  it('submits a task for review with a selected reviewer', async () => {
    prismaMock.task.findUnique
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task',
        creatorId: 'creator-1',
        assigneeId: 'assignee-1',
        reviewerId: null,
        reviewDueDate: null,
        approvalStatus: TaskApprovalStatus.NONE,
        column: {
          board: {
            project: {
              id: 'project-1',
              name: 'Demo Project',
              members: [
                { userId: 'creator-1', role: 'MEMBER' },
                { userId: 'reviewer-1', role: 'ADMIN' },
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        title: 'Task',
        approvalStatus: TaskApprovalStatus.IN_REVIEW,
        reviewer: { id: 'reviewer-1', name: 'Reviewer One' },
        reviews: [],
        comments: [],
        attachments: [],
        labels: [],
        column: { id: 'col-1', name: 'Review', board: { id: 'board-1', name: 'Main', projectId: 'project-1' } },
      })

    prismaMock.task.update.mockResolvedValue({
      id: 'task-1',
      title: 'Task',
      reviewer: { id: 'reviewer-1', name: 'Reviewer One' },
      labels: [],
      _count: { comments: 0, attachments: 0 },
    })

    await service.submitForReview('task-1', {
      reviewerId: 'reviewer-1',
      comment: 'Please review the API contract',
    }, 'creator-1')

    expect(prismaMock.task.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        reviewerId: 'reviewer-1',
        approvalStatus: TaskApprovalStatus.IN_REVIEW,
      }),
    }))
    expect(prismaMock.taskReview.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        action: TaskReviewAction.SUBMITTED,
        reviewerId: 'reviewer-1',
      }),
    }))
    expect(notificationServiceMock.notifyTaskReviewSubmitted).toHaveBeenCalled()
  })

  it('rejects self-review submission', async () => {
    prismaMock.task.findUnique.mockResolvedValue({
      id: 'task-1',
      title: 'Task',
      creatorId: 'creator-1',
      assigneeId: 'creator-1',
      reviewerId: null,
      reviewDueDate: null,
      approvalStatus: TaskApprovalStatus.NONE,
      column: {
        board: {
          project: {
            id: 'project-1',
            name: 'Demo Project',
            members: [
              { userId: 'creator-1', role: 'ADMIN' },
            ],
          },
        },
      },
    })

    await expect(service.submitForReview('task-1', {
      reviewerId: 'creator-1',
    }, 'creator-1')).rejects.toBeInstanceOf(BadRequestException)
  })
})
