import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateProjectLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
  color?: string;
}

export class UpdateProjectLabelDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
  color?: string;
}
