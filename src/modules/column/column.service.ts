import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';

@Injectable()
export class ColumnService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateColumnDto) {
    // Get the max position for existing columns in this board
    const maxPosition = await this.prisma.column.aggregate({
      where: { boardId: dto.boardId },
      _max: { position: true },
    });

    const position = dto.position ?? (maxPosition._max.position ?? -1) + 1;

    return this.prisma.column.create({
      data: {
        name: dto.name,
        boardId: dto.boardId,
        position,
        color: dto.color,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async update(columnId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: dto,
    });
  }

  async delete(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return this.prisma.column.delete({
      where: { id: columnId },
    });
  }

  async reorder(dto: ReorderColumnsDto) {
    const operations = dto.columns.map((col) =>
      this.prisma.column.update({
        where: { id: col.id },
        data: { position: col.position },
      }),
    );

    return this.prisma.$transaction(operations);
  }
}
