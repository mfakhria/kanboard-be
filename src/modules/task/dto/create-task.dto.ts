import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  ValidateNested,
  Matches,
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

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  columnId: string;

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

  @IsInt()
  @IsOptional()
  position?: number;
}
