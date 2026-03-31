import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority } from '@prisma/client';

class TaskLabelInputDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
  color?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskLabelInputDto)
  @IsOptional()
  labels?: TaskLabelInputDto[];

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
