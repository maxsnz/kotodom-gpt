"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotResource = void 0;
var prisma_1 = require("@adminjs/prisma");
var prismaClient_1 = require("../../prismaClient");
var bots_1 = require("../../bots");
// icons https://feathericons.com/
// Available OpenAI models (excluding very expensive ones)
var AVAILABLE_MODELS = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Cheapest)" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4o", label: "GPT-4o (High Quality)" },
    { value: "gpt-4.1", label: "GPT-4.1 (Premium)" },
    { value: "gpt-5-nano", label: "GPT-5 Nano (Latest)" },
    { value: "gpt-5-mini", label: "GPT-5 Mini (Latest)" },
];
var createBotResource = function () { return ({
    resource: { model: (0, prisma_1.getModelByName)("Bot"), client: prismaClient_1.default },
    options: {
        listProperties: ["id", "name", "model", "enabled", "createdAt"],
        sort: {
            sortBy: "id",
            direction: "asc",
        },
        properties: {
            model: {
                availableValues: AVAILABLE_MODELS,
                isVisible: {
                    list: true,
                    filter: true,
                    show: true,
                    edit: true,
                },
            },
        },
        actions: {
            new: {
                // @ts-ignore-next-line
                after: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, bots_1.default.initById(context.record.params.id)];
                            case 1:
                                result = _b.sent();
                                return [2 /*return*/, {
                                        record: context.record.toJSON(context.currentAdmin),
                                        redirectUrl: context.h.resourceUrl({
                                            resourceId: ((_a = context.resource._decorated) === null || _a === void 0 ? void 0 : _a.id()) || context.resource.id(),
                                        }),
                                        notice: result
                                            ? {
                                                message: "Bot [".concat(context.record.params.name, "] inited"),
                                                type: "success",
                                            }
                                            : {
                                                message: "Error initing bot [".concat(context.record.params.name, "]"),
                                                type: "error",
                                            },
                                    }];
                        }
                    });
                }); },
            },
            start: {
                icon: "play-outline",
                actionType: "record",
                component: false,
                // guard: "Start?",
                // @ts-ignore-next-line
                handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
                    var record, resource, currentAdmin, h, id, name, result;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                record = context.record, resource = context.resource, currentAdmin = context.currentAdmin, h = context.h;
                                id = record.params.id;
                                name = record.params.name;
                                return [4 /*yield*/, bots_1.default.startById(id)];
                            case 1:
                                result = _b.sent();
                                return [2 /*return*/, {
                                        record: record.toJSON(currentAdmin),
                                        redirectUrl: h.resourceUrl({
                                            resourceId: ((_a = resource._decorated) === null || _a === void 0 ? void 0 : _a.id()) || resource.id(),
                                        }),
                                        notice: result
                                            ? {
                                                message: "Bot [".concat(name, "] started"),
                                                type: "success",
                                            }
                                            : {
                                                message: "Error starting bot [".concat(name, "]"),
                                                type: "error",
                                            },
                                    }];
                        }
                    });
                }); },
                // @ts-ignore-next-line
                isVisible: function (_a) {
                    var record = _a.record;
                    return !record.params.enabled;
                },
            },
            stop: {
                icon: "stop-circle",
                actionType: "record",
                component: false,
                // guard: "Reject?",
                // @ts-ignore-next-line
                handler: function (request, response, context) { return __awaiter(void 0, void 0, void 0, function () {
                    var record, resource, currentAdmin, h, id, name, result;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                record = context.record, resource = context.resource, currentAdmin = context.currentAdmin, h = context.h;
                                id = record.params.id;
                                name = record.params.name;
                                return [4 /*yield*/, bots_1.default.stopById(id)];
                            case 1:
                                result = _b.sent();
                                return [2 /*return*/, {
                                        record: record.toJSON(currentAdmin),
                                        redirectUrl: h.resourceUrl({
                                            resourceId: ((_a = resource._decorated) === null || _a === void 0 ? void 0 : _a.id()) || resource.id(),
                                        }),
                                        notice: result
                                            ? {
                                                message: "Bot [".concat(name, "] stopped"),
                                                type: "success",
                                            }
                                            : {
                                                message: "Error stopping bot [".concat(name, "]"),
                                                type: "error",
                                            },
                                    }];
                        }
                    });
                }); },
                // @ts-ignore-next-line
                isVisible: function (_a) {
                    var record = _a.record;
                    return record.params.enabled;
                },
            },
        },
    },
}); };
exports.createBotResource = createBotResource;
