import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitTaskReviewDto {
  @IsString()
  @IsOptional()
  reviewerId?: string;

  @IsDateString()
  @IsOptional()
  reviewDueDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
