import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  async create(@Body() dto: CreateColumnDto) {
    return this.columnService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnService.update(columnId, dto);
  }

  @Delete(':id')
  async delete(@Param('id') columnId: string) {
    return this.columnService.delete(columnId);
  }

  @Patch('reorder/batch')
  async reorder(@Body() dto: ReorderColumnsDto) {
    return this.columnService.reorder(dto);
  }
}
