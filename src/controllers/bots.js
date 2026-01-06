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
exports.sendMessage = exports.stopBot = exports.startBot = void 0;
var prismaClient_1 = require("../prismaClient");
var bots_1 = require("../bots");
var startBot = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var botId;
    return __generator(this, function (_a) {
        try {
            if (!ctx.params.id) {
                throw Error("No bot id provided");
            }
            botId = parseInt(ctx.params.id);
            if (!botId) {
                throw Error("Invalid bot id");
            }
            bots_1.default.startById(botId);
            ctx.body = JSON.stringify({});
        }
        catch (e) {
            console.error(e);
            ctx.status = 403;
            ctx.body = { error: JSON.stringify(e) };
        }
        return [2 /*return*/];
    });
}); };
exports.startBot = startBot;
var stopBot = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var botId;
    return __generator(this, function (_a) {
        try {
            if (!ctx.params.id) {
                throw Error("No bot id provided");
            }
            botId = parseInt(ctx.params.id);
            if (!botId) {
                throw Error("Invalid bot id");
            }
            bots_1.default.stopById(botId);
            ctx.body = JSON.stringify({});
        }
        catch (e) {
            console.error(e);
            ctx.status = 403;
            ctx.body = { error: JSON.stringify(e) };
        }
        return [2 /*return*/];
    });
}); };
exports.stopBot = stopBot;
var sendMessage = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, chatId, botId, message, result, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                if (!("request" in ctx) || !("body" in ctx.request)) {
                    throw new Error("Invalid request");
                }
                _a = ctx.request.body, chatId = _a.chatId, botId = _a.botId, message = _a.message;
                if (!chatId) {
                    throw Error("No chatId provided");
                }
                if (!botId || typeof botId !== "number") {
                    throw Error("No botId provided");
                }
                if (!message) {
                    throw Error("No message provided");
                }
                return [4 /*yield*/, bots_1.default.sendMessage({
                        botId: botId,
                        chatId: chatId,
                        message: message,
                    })];
            case 1:
                result = _b.sent();
                // Save the admin message to the database
                return [4 /*yield*/, prismaClient_1.default.message.create({
                        data: {
                            chatId: chatId,
                            botId: botId,
                            text: message,
                            price: 0, // Admin messages have no cost
                            createdAt: new Date(),
                            tgUserId: null,
                        },
                    })];
            case 2:
                // Save the admin message to the database
                _b.sent();
                ctx.body = JSON.stringify({ ok: true });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _b.sent();
                console.error(e_1);
                ctx.status = 403;
                ctx.body = { error: JSON.stringify(e_1) };
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendMessage = sendMessage;
