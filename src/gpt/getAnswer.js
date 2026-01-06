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
var _1 = require(".");
// import prisma from "../prismaClient";
var openaiPricing_1 = require("../utils/openaiPricing");
var logger_1 = require("../utils/logger");
var checkThread = function (threadId, runId) { return __awaiter(void 0, void 0, void 0, function () {
    var run;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, _1.default.instance.beta.threads.runs.retrieve(threadId, runId)];
            case 1:
                run = _a.sent();
                if (run.status === "failed") {
                    console.error(run.last_error);
                    return [2 /*return*/, [run.status, run.last_error]];
                }
                return [2 /*return*/, [run.status]];
        }
    });
}); };
var waitThreadCompleted = function (threadId, runId) {
    return new Promise(function (resolve, reject) {
        var interval = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, status_1, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, checkThread(threadId, runId)];
                    case 1:
                        _a = _b.sent(), status_1 = _a[0], error = _a[1];
                        if (status_1 === "completed") {
                            clearInterval(interval);
                            resolve();
                        }
                        else if (status_1 === "failed") {
                            clearInterval(interval);
                            reject(error);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        clearInterval(interval);
                        reject(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, 500);
    });
};
var getAnswer = function (assistantId, threadId, messageText, model // Optional model override
) { return __awaiter(void 0, void 0, void 0, function () {
    var message, runConfig, run, runId, completedRun, messages, mText, answer, pricing, modelToUse, _a, usage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, _1.default.instance.beta.threads.messages.create(threadId, {
                    role: "user",
                    content: messageText,
                })];
            case 1:
                message = _b.sent();
                runConfig = {
                    assistant_id: assistantId,
                    // instructions: getInstructions(username),
                };
                // Override model if provided
                if (model) {
                    runConfig.model = model;
                }
                return [4 /*yield*/, _1.default.instance.beta.threads.runs.create(threadId, runConfig)];
            case 2:
                run = _b.sent();
                runId = run.id;
                return [4 /*yield*/, waitThreadCompleted(threadId, runId)];
            case 3:
                _b.sent();
                return [4 /*yield*/, _1.default.instance.beta.threads.runs.retrieve(threadId, runId)];
            case 4:
                completedRun = _b.sent();
                return [4 /*yield*/, _1.default.instance.beta.threads.messages.list(threadId)];
            case 5:
                messages = _b.sent();
                mText = messages.data[0].content.find(function (item) { return item.type === "text"; });
                if (!mText) {
                    return [2 /*return*/, {
                            answer: "no answer from chatGPT",
                            pricing: null,
                        }];
                }
                answer = mText.text.value || "no answer from chatGPT";
                pricing = null;
                if (!completedRun.usage) return [3 /*break*/, 8];
                logger_1.logger.info("[OpenAI] Raw usage data: " + JSON.stringify(completedRun.usage, null, 2));
                _a = model;
                if (_a) return [3 /*break*/, 7];
                return [4 /*yield*/, (0, openaiPricing_1.extractModelFromAssistant)(assistantId, _1.default.instance)];
            case 6:
                _a = (_b.sent());
                _b.label = 7;
            case 7:
                modelToUse = _a;
                usage = {
                    prompt_tokens: completedRun.usage.prompt_tokens,
                    completion_tokens: completedRun.usage.completion_tokens,
                    total_tokens: completedRun.usage.total_tokens,
                };
                pricing = (0, openaiPricing_1.calculateOpenAICost)(modelToUse, usage);
                logger_1.logger.info("[OpenAI] Model: ".concat(modelToUse).concat(model ? " (overridden)" : "", ", Usage: ").concat(usage.total_tokens, " tokens (").concat(usage.prompt_tokens, " input + ").concat(usage.completion_tokens, " output), Cost: $").concat(pricing.totalCost.toFixed(6)));
                return [3 /*break*/, 9];
            case 8:
                logger_1.logger.info("[OpenAI] No usage information available for pricing calculation");
                logger_1.logger.info("[OpenAI] Completed run data: " + JSON.stringify(completedRun, null, 2));
                _b.label = 9;
            case 9: return [2 /*return*/, {
                    answer: answer,
                    pricing: pricing,
                }];
        }
    });
}); };
exports.default = getAnswer;
