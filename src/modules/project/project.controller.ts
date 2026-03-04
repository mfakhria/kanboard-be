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
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.create(dto, userId);
  }

  @Get()
  async findAll(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.findAllByWorkspace(workspaceId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.findById(projectId, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.update(projectId, dto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.delete(projectId, userId);
  }
}
