import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.findAllByWorkspace(workspaceId, userId);
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.create(dto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') taskId: string) {
    return this.taskService.findById(taskId);
  }

  @Patch(':id')
  async update(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(taskId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') taskId: string) {
    return this.taskService.delete(taskId);
  }

  @Patch(':id/move')
  async move(
    @Param('id') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.taskService.move(taskId, dto);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') taskId: string,
    @Body('assigneeId') assigneeId: string | null,
  ) {
    return this.taskService.assignMember(taskId, assigneeId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') taskId: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.addComment(taskId, content, userId);
  }
}
