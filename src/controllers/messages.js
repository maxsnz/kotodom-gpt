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
exports.getUserChats = exports.getMessages = void 0;
var prismaClient_1 = require("../prismaClient");
var getMessages = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var chatId, messages, chat, bot, tgUser, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                chatId = ctx.params.chatId;
                if (!chatId) {
                    throw Error("No chatId provided");
                }
                return [4 /*yield*/, prismaClient_1.default.message.findMany({
                        where: {
                            chatId: chatId,
                        },
                    })];
            case 1:
                messages = _a.sent();
                return [4 /*yield*/, prismaClient_1.default.chat.findUnique({
                        where: {
                            id: chatId,
                        },
                        include: {
                            bot: true,
                            tgUser: true,
                        },
                    })];
            case 2:
                chat = _a.sent();
                bot = chat === null || chat === void 0 ? void 0 : chat.bot;
                tgUser = chat === null || chat === void 0 ? void 0 : chat.tgUser;
                if (!bot) {
                    throw Error("Bot not found");
                }
                if (!tgUser) {
                    throw Error("TgUser not found");
                }
                ctx.body = JSON.stringify({
                    messages: messages.map(function (message) { return ({
                        id: message.id,
                        text: message.text,
                        createdAt: message.createdAt,
                        isUser: !!message.tgUserId,
                        price: message.price,
                    }); }),
                    bot: {
                        id: bot.id,
                        name: bot.name,
                    },
                    user: {
                        id: tgUser.id,
                        name: tgUser.username,
                        username: tgUser.username,
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.error(e_1);
                ctx.status = 403;
                ctx.body = { error: JSON.stringify(e_1) };
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getMessages = getMessages;
var getUserChats = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, tgUser, chats, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = ctx.params.userId;
                if (!userId) {
                    throw Error("No userId provided");
                }
                return [4 /*yield*/, prismaClient_1.default.tgUser.findUnique({
                        where: {
                            id: BigInt(userId),
                        },
                    })];
            case 1:
                tgUser = _a.sent();
                if (!tgUser) {
                    throw Error("TgUser not found");
                }
                return [4 /*yield*/, prismaClient_1.default.chat.findMany({
                        where: {
                            tgUserId: BigInt(userId),
                        },
                        include: {
                            bot: true,
                            _count: {
                                select: {
                                    messages: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    })];
            case 2:
                chats = _a.sent();
                ctx.body = JSON.stringify({
                    chats: chats.map(function (chat) { return ({
                        id: chat.id,
                        name: chat.name,
                        createdAt: chat.createdAt,
                        bot: chat.bot
                            ? {
                                id: chat.bot.id,
                                name: chat.bot.name,
                            }
                            : null,
                        messagesCount: chat._count.messages,
                    }); }),
                    user: {
                        id: tgUser.id.toString(),
                        username: tgUser.username || tgUser.name || tgUser.fullName,
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                console.error(e_2);
                ctx.status = 403;
                ctx.body = { error: JSON.stringify(e_2) };
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserChats = getUserChats;
