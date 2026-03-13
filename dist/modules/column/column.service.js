"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ColumnService = class ColumnService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
    async update(columnId, dto) {
        const column = await this.prisma.column.findUnique({
            where: { id: columnId },
        });
        if (!column) {
            throw new common_1.NotFoundException('Column not found');
        }
        return this.prisma.column.update({
            where: { id: columnId },
            data: dto,
        });
    }
    async delete(columnId) {
        const column = await this.prisma.column.findUnique({
            where: { id: columnId },
        });
        if (!column) {
            throw new common_1.NotFoundException('Column not found');
        }
        return this.prisma.column.delete({
            where: { id: columnId },
        });
    }
    async reorder(dto) {
        const operations = dto.columns.map((col) => this.prisma.column.update({
            where: { id: col.id },
            data: { position: col.position },
        }));
        return this.prisma.$transaction(operations);
    }
};
exports.ColumnService = ColumnService;
exports.ColumnService = ColumnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ColumnService);
//# sourceMappingURL=column.service.js.map