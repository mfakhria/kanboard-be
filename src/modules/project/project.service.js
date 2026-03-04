"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
var common_1 = require("@nestjs/common");
var ProjectService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProjectService = _classThis = /** @class */ (function () {
        function ProjectService_1(prisma) {
            this.prisma = prisma;
        }
        ProjectService_1.prototype.create = function (dto, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var project;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // Verify user is a member of the workspace
                        return [4 /*yield*/, this.ensureWorkspaceMember(dto.workspaceId, userId)];
                        case 1:
                            // Verify user is a member of the workspace
                            _a.sent();
                            return [4 /*yield*/, this.prisma.project.create({
                                    data: {
                                        name: dto.name,
                                        description: dto.description,
                                        color: dto.color,
                                        workspaceId: dto.workspaceId,
                                        boards: {
                                            create: {
                                                name: 'Main Board',
                                                columns: {
                                                    create: [
                                                        { name: 'To Do', position: 0, color: '#6366f1' },
                                                        { name: 'In Progress', position: 1, color: '#f59e0b' },
                                                        { name: 'Review', position: 2, color: '#3b82f6' },
                                                        { name: 'Done', position: 3, color: '#10b981' },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    include: {
                                        boards: {
                                            include: {
                                                columns: {
                                                    orderBy: { position: 'asc' },
                                                },
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            project = _a.sent();
                            return [2 /*return*/, project];
                    }
                });
            });
        };
        ProjectService_1.prototype.findAllByWorkspace = function (workspaceId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ensureWorkspaceMember(workspaceId, userId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.prisma.project.findMany({
                                    where: { workspaceId: workspaceId },
                                    include: {
                                        _count: {
                                            select: {
                                                boards: true,
                                            },
                                        },
                                    },
                                    orderBy: { createdAt: 'desc' },
                                })];
                    }
                });
            });
        };
        ProjectService_1.prototype.findById = function (projectId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, isMember;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                include: {
                                    workspace: {
                                        include: {
                                            members: true,
                                        },
                                    },
                                    boards: {
                                        include: {
                                            columns: {
                                                include: {
                                                    tasks: {
                                                        include: {
                                                            assignee: {
                                                                select: {
                                                                    id: true,
                                                                    name: true,
                                                                    email: true,
                                                                    avatar: true,
                                                                },
                                                            },
                                                            _count: {
                                                                select: { comments: true },
                                                            },
                                                        },
                                                        orderBy: { position: 'asc' },
                                                    },
                                                },
                                                orderBy: { position: 'asc' },
                                            },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException('Project not found');
                            }
                            isMember = project.workspace.members.some(function (m) { return m.userId === userId; });
                            if (!isMember) {
                                throw new common_1.ForbiddenException('You do not have access to this project');
                            }
                            return [2 /*return*/, project];
                    }
                });
            });
        };
        ProjectService_1.prototype.update = function (projectId, dto, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, isMember;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                include: { workspace: { include: { members: true } } },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException('Project not found');
                            }
                            isMember = project.workspace.members.some(function (m) { return m.userId === userId; });
                            if (!isMember) {
                                throw new common_1.ForbiddenException('You do not have access to this project');
                            }
                            return [2 /*return*/, this.prisma.project.update({
                                    where: { id: projectId },
                                    data: dto,
                                })];
                    }
                });
            });
        };
        ProjectService_1.prototype.delete = function (projectId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, member;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                include: { workspace: { include: { members: true } } },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException('Project not found');
                            }
                            member = project.workspace.members.find(function (m) { return m.userId === userId; });
                            if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
                                throw new common_1.ForbiddenException('Only workspace owners/admins can delete projects');
                            }
                            return [2 /*return*/, this.prisma.project.delete({
                                    where: { id: projectId },
                                })];
                    }
                });
            });
        };
        // ─── Helpers ─────────────────────────────────────────────────────────────────
        ProjectService_1.prototype.ensureWorkspaceMember = function (workspaceId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var member;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.workspaceMember.findUnique({
                                where: {
                                    userId_workspaceId: { userId: userId, workspaceId: workspaceId },
                                },
                            })];
                        case 1:
                            member = _a.sent();
                            if (!member) {
                                throw new common_1.ForbiddenException('You are not a member of this workspace');
                            }
                            return [2 /*return*/, member];
                    }
                });
            });
        };
        return ProjectService_1;
    }());
    __setFunctionName(_classThis, "ProjectService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProjectService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProjectService = _classThis;
}();
exports.ProjectService = ProjectService;
