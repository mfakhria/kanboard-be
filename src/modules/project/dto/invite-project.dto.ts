import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class InviteToProjectDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(ProjectRole)
  @IsOptional()
  role?: ProjectRole;
}

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UpdateMemberRoleDto {
  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
