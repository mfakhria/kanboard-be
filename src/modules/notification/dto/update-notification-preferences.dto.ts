import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  taskAssigned?: boolean;

  @IsBoolean()
  @IsOptional()
  taskCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  taskOverdue?: boolean;

  @IsBoolean()
  @IsOptional()
  projectUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  teamActivity?: boolean;

  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;
}
