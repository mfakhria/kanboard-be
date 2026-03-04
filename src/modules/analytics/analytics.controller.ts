import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('workspace/:workspaceId')
  async getWorkspaceStats(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getWorkspaceStats(workspaceId);
  }

  @Get('project/:projectId')
  async getProjectStats(@Param('projectId') projectId: string) {
    return this.analyticsService.getProjectStats(projectId);
  }

  @Get('weekly')
  async getWeeklySummary(@Query('workspaceId') workspaceId: string) {
    return this.analyticsService.getWeeklySummary(workspaceId);
  }
}
