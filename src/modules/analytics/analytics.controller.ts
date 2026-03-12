import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('workspace/:workspaceId')
  async getWorkspaceStats(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.analyticsService.getWorkspaceStats(workspaceId, userId);
  }

  @Get('project/:projectId')
  async getProjectStats(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectStats(projectId);
  }

  @Get('weekly')
  async getWeeklySummary(@Query('workspaceId') workspaceId: string) {
    return this.analyticsService.getWeeklySummary(workspaceId);
  }

  @Get('overview/:workspaceId')
  async getOverviewStats(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.analyticsService.getOverviewStats(workspaceId, userId);
  }
}
