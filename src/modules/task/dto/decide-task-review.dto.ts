import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideTaskReviewDto {
  @IsIn(['APPROVED', 'CHANGES_REQUESTED'])
  decision: 'APPROVED' | 'CHANGES_REQUESTED';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
