import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto, InviteMemberDto, AssignRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async create(
    @Body() dto: CreateWorkspaceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.create(dto, userId);
  }

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.workspaceService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.findById(workspaceId, userId);
  }

  @Post(':id/members')
  async inviteMember(
    @Param('id') workspaceId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.inviteMember(workspaceId, dto, userId);
  }

  @Get(':id/members')
  async listMembers(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.listMembers(workspaceId, userId);
  }

  @Patch(':id/members/:memberId/role')
  async assignRole(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: AssignRoleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.assignRole(workspaceId, memberId, dto, userId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.removeMember(workspaceId, memberId, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.delete(workspaceId, userId);
  }
}
