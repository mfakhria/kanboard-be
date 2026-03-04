import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async findByProject(@Query('projectId') projectId: string) {
    return this.boardService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') boardId: string) {
    return this.boardService.findById(boardId);
  }
}
