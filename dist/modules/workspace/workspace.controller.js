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
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const workspace_service_1 = require("./workspace.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const decorators_1 = require("../../common/decorators");
let WorkspaceController = class WorkspaceController {
    constructor(workspaceService) {
        this.workspaceService = workspaceService;
    }
    async create(dto, userId) {
        return this.workspaceService.create(dto, userId);
    }
    async findAll(userId) {
        return this.workspaceService.findAllByUser(userId);
    }
    async findOne(workspaceId, userId) {
        return this.workspaceService.findById(workspaceId, userId);
    }
    async inviteMember(workspaceId, dto, userId) {
        return this.workspaceService.inviteMember(workspaceId, dto, userId);
    }
    async listMembers(workspaceId, userId) {
        return this.workspaceService.listMembers(workspaceId, userId);
    }
    async assignRole(workspaceId, memberId, dto, userId) {
        return this.workspaceService.assignRole(workspaceId, memberId, dto, userId);
    }
    async removeMember(workspaceId, memberId, userId) {
        return this.workspaceService.removeMember(workspaceId, memberId, userId);
    }
    async delete(workspaceId, userId) {
        return this.workspaceService.delete(workspaceId, userId);
    }
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWorkspaceDto, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.InviteMemberDto, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "listMembers", null);
__decorate([
    (0, common_1.Patch)(':id/members/:memberId/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AssignRoleDto, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "delete", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, common_1.Controller)('workspaces'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map