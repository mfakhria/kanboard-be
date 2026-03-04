import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class MoveTaskDto {
  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsInt()
  position: number;
}
