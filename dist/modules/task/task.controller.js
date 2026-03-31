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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const task_service_1 = require("./task.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const decorators_1 = require("../../common/decorators");
const upload_path_util_1 = require("../../common/utils/upload-path.util");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    async findAll(workspaceId, userId) {
        return this.taskService.findAllByWorkspace(workspaceId, userId);
    }
    async create(dto, userId) {
        return this.taskService.create(dto, userId);
    }
    async findOne(taskId) {
        return this.taskService.findById(taskId);
    }
    async update(taskId, dto, userId) {
        return this.taskService.update(taskId, dto, userId);
    }
    async delete(taskId, userId) {
        return this.taskService.delete(taskId, userId);
    }
    async move(taskId, dto, userId) {
        return this.taskService.move(taskId, dto, userId);
    }
    async assign(taskId, assigneeId, userId) {
        return this.taskService.assignMember(taskId, assigneeId, userId);
    }
    async addComment(taskId, content, userId) {
        return this.taskService.addComment(taskId, content, userId);
    }
    async submitForReview(taskId, dto, userId) {
        return this.taskService.submitForReview(taskId, dto, userId);
    }
    async decideReview(taskId, dto, userId) {
        return this.taskService.decideReview(taskId, dto, userId);
    }
    async cancelReview(taskId, userId) {
        return this.taskService.cancelReview(taskId, userId);
    }
    async uploadAttachment(taskId, file, userId) {
        return this.taskService.addAttachment(taskId, file, userId);
    }
    async deleteAttachment(taskId, attachmentId, userId) {
        return this.taskService.deleteAttachment(taskId, attachmentId, userId);
    }
};
exports.TaskController = TaskController;
TaskController.allowedAttachmentMimeTypes = /^(image\/(jpeg|png|gif|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-powerpoint|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation|text\/plain|text\/csv|application\/zip|application\/x-zip-compressed)$/i;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTaskDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTaskDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.MoveTaskDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "move", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('assigneeId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/review/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SubmitTaskReviewDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Post)(':id/review/decision'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DecideTaskReviewDto, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "decideReview", null);
__decorate([
    (0, common_1.Post)(':id/review/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "cancelReview", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (0, upload_path_util_1.ensureTaskAttachmentsPath)(),
            filename: (_, file, callback) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                callback(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({
        fileType: TaskController.allowedAttachmentMimeTypes,
        fallbackToMimetype: true,
    })
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({
        fileIsRequired: true,
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    }))),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "uploadAttachment", null);
__decorate([
    (0, common_1.Delete)(':id/attachments/:attachmentId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('attachmentId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteAttachment", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map