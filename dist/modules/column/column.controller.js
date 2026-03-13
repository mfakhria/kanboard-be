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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnController = void 0;
const common_1 = require("@nestjs/common");
const column_service_1 = require("./column.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ColumnController = class ColumnController {
    constructor(columnService) {
        this.columnService = columnService;
    }
    async create(dto) {
        return this.columnService.create(dto);
    }
    async update(columnId, dto) {
        return this.columnService.update(columnId, dto);
    }
    async delete(columnId) {
        return this.columnService.delete(columnId);
    }
    async reorder(dto) {
        return this.columnService.reorder(dto);
    }
};
exports.ColumnController = ColumnController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateColumnDto]),
    __metadata("design:returntype", Promise)
], ColumnController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateColumnDto]),
    __metadata("design:returntype", Promise)
], ColumnController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ColumnController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('reorder/batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReorderColumnsDto]),
    __metadata("design:returntype", Promise)
], ColumnController.prototype, "reorder", null);
exports.ColumnController = ColumnController = __decorate([
    (0, common_1.Controller)('columns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [column_service_1.ColumnService])
], ColumnController);
//# sourceMappingURL=column.controller.js.map