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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const decorators_1 = require("../../common/decorators");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async create(dto, userId) {
        return this.projectService.create(dto, userId);
    }
    async findAll(workspaceId, userId) {
        return this.projectService.findAllByWorkspace(workspaceId, userId);
    }
    async getPendingInvitations(userId) {
        return this.projectService.getPendingInvitations(userId);
    }
    async acceptInvitation(dto, userId) {
        return this.projectService.acceptInvitation(dto.token, userId);
    }
    async declineInvitation(dto, userId) {
        return this.projectService.declineInvitation(dto.token, userId);
    }
    async findOne(projectId, userId) {
        return this.projectService.findById(projectId, userId);
    }
    async update(projectId, dto, userId) {
        return this.projectService.update(projectId, dto, userId);
    }
    async delete(projectId, userId) {
        return this.projectService.delete(projectId, userId);
    }
    async inviteMember(projectId, dto, userId) {
        return this.projectService.inviteMember(projectId, dto, userId);
    }
    async getMembers(projectId, userId) {
        return this.projectService.getProjectMembers(projectId, userId);
    }
    async getInvitations(projectId, userId) {
        return this.projectService.getProjectInvitations(projectId, userId);
    }
    async updateMemberRole(projectId, memberId, dto, userId) {
        return this.projectService.updateMemberRole(projectId, memberId, dto, userId);
    }
    async removeMember(projectId, memberId, userId) {
        return this.projectService.removeMember(projectId, memberId, userId);
    }
    async cancelInvitation(invitationId, userId) {
        return this.projectService.cancelInvitation(invitationId, userId);
    }
    async getLabels(projectId, userId) {
        return this.projectService.getProjectLabels(projectId, userId);
    }
    async createLabel(projectId, dto, userId) {
        return this.projectService.createProjectLabel(projectId, dto, userId);
    }
    async updateLabel(projectId, labelId, dto, userId) {
        return this.projectService.updateProjectLabel(projectId, labelId, dto, userId);
    }
    async deleteLabel(projectId, labelId, userId) {
        return this.projectService.deleteProjectLabel(projectId, labelId, userId);
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateProjectDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('invitations/pending'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getPendingInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/accept'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AcceptInvitationDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Post)('invitations/decline'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AcceptInvitationDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "declineInvitation", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProjectDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.InviteToProjectDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Get)(':id/invitations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Patch)(':id/members/:memberId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateMemberRoleDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Delete)(':id/invitations/:invitationId'),
    __param(0, (0, common_1.Param)('invitationId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Get)(':id/labels'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getLabels", null);
__decorate([
    (0, common_1.Post)(':id/labels'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateProjectLabelDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "createLabel", null);
__decorate([
    (0, common_1.Patch)(':id/labels/:labelId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('labelId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateProjectLabelDto, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateLabel", null);
__decorate([
    (0, common_1.Delete)(':id/labels/:labelId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('labelId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "deleteLabel", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map