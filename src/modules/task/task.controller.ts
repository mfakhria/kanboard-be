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
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TaskService } from './task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  SubmitTaskReviewDto,
  DecideTaskReviewDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  private static readonly allowedAttachmentMimeTypes =
    /^(image\/(jpeg|png|gif|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation|text\/plain|text\/csv|application\/zip|application\/x-zip-compressed)$/i;

  private static getUploadDestination() {
    const destination = join(process.cwd(), 'uploads', 'task-attachments');
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }
    return destination;
  }

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
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.update(taskId, dto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.delete(taskId, userId);
  }

  @Patch(':id/move')
  async move(
    @Param('id') taskId: string,
    @Body() dto: MoveTaskDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.move(taskId, dto, userId);
  }

  @Patch(':id/assign')
  async assign(
    @Param('id') taskId: string,
    @Body('assigneeId') assigneeId: string | null,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.assignMember(taskId, assigneeId, userId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') taskId: string,
    @Body('content') content: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.addComment(taskId, content, userId);
  }

  @Post(':id/review/submit')
  async submitForReview(
    @Param('id') taskId: string,
    @Body() dto: SubmitTaskReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.submitForReview(taskId, dto, userId);
  }

  @Post(':id/review/decision')
  async decideReview(
    @Param('id') taskId: string,
    @Body() dto: DecideTaskReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.decideReview(taskId, dto, userId);
  }

  @Post(':id/review/cancel')
  async cancelReview(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.cancelReview(taskId, userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: TaskController.getUploadDestination(),
      filename: (_: any, file: any, callback: any) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadAttachment(
    @Param('id') taskId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: TaskController.allowedAttachmentMimeTypes,
          fallbackToMimetype: true,
        })
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.addAttachment(taskId, file, userId);
  }

  @Delete(':id/attachments/:attachmentId')
  async deleteAttachment(
    @Param('id') taskId: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskService.deleteAttachment(taskId, attachmentId, userId);
  }
}
