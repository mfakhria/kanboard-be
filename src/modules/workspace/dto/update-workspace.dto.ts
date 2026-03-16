import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
