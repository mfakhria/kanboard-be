import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsInt()
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  color?: string;
}
