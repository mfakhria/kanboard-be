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
import { CreateProjectDto, UpdateProjectDto, InviteToProjectDto, AcceptInvitationDto, UpdateMemberRoleDto } from './dto';
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

  @Get('invitations/pending')
  async getPendingInvitations(
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getPendingInvitations(userId);
  }

  @Post('invitations/accept')
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.acceptInvitation(dto.token, userId);
  }

  @Post('invitations/decline')
  async declineInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.declineInvitation(dto.token, userId);
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

  // ─── Project Members ──────────────────────────────────────────────────────

  @Post(':id/invite')
  async inviteMember(
    @Param('id') projectId: string,
    @Body() dto: InviteToProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.inviteMember(projectId, dto, userId);
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getProjectMembers(projectId, userId);
  }

  @Get(':id/invitations')
  async getInvitations(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getProjectInvitations(projectId, userId);
  }

  @Patch(':id/members/:memberId')
  async updateMemberRole(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.updateMemberRole(projectId, memberId, dto, userId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.removeMember(projectId, memberId, userId);
  }

  @Delete(':id/invitations/:invitationId')
  async cancelInvitation(
    @Param('invitationId') invitationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.cancelInvitation(invitationId, userId);
  }
}
