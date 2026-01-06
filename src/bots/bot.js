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
exports.TgBot = void 0;
var dotenv = require("dotenv");
var telegraf_1 = require("telegraf");
var filters_1 = require("telegraf/filters");
var gpt_1 = require("../gpt");
var getAnswer_1 = require("../gpt/getAnswer");
var prismaClient_1 = require("../prismaClient");
var logger_1 = require("../utils/logger");
dotenv.config();
var getUserName = function (messageChat) {
    var name = "";
    var first_name = messageChat.first_name, last_name = messageChat.last_name;
    if (messageChat.first_name) {
        // username = `${username} ${chat.first_name}`;
        name = "".concat(first_name);
    }
    if (last_name) {
        name = name.length > 0 ? "".concat(name, " ").concat(last_name) : "".concat(last_name);
    }
    if (!first_name && !last_name) {
        name = "Инкогнито";
    }
    return name;
};
var findOrCreateUser = function (id, messageChat) { return __awaiter(void 0, void 0, void 0, function () {
    var user, fullName;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prismaClient_1.default.tgUser.findUnique({
                    where: {
                        id: id,
                    },
                })];
            case 1:
                user = _a.sent();
                if (!!user) return [3 /*break*/, 3];
                fullName = getUserName(messageChat);
                return [4 /*yield*/, prismaClient_1.default.tgUser.create({
                        data: {
                            id: id,
                            username: messageChat.username,
                            fullName: fullName,
                            createdAt: new Date(),
                        },
                    })];
            case 2: return [2 /*return*/, _a.sent()];
            case 3: return [2 /*return*/, user];
        }
    });
}); };
var findOrCreateChat = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var chat, thread, threadId, thread, threadId;
    var id = _b.id, userId = _b.userId, name = _b.name, botName = _b.botName, botId = _b.botId;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prismaClient_1.default.chat.findFirst({
                    where: {
                        id: id,
                    },
                })];
            case 1:
                chat = _c.sent();
                if (!!chat) return [3 /*break*/, 4];
                return [4 /*yield*/, gpt_1.default.instance.beta.threads.create()];
            case 2:
                thread = _c.sent();
                threadId = thread.id;
                return [4 /*yield*/, prismaClient_1.default.chat.create({
                        data: {
                            id: id,
                            createdAt: new Date(),
                            tgUserId: userId,
                            threadId: threadId,
                            name: "".concat(name, " vs ").concat(botName),
                            botId: botId,
                        },
                    })];
            case 3: return [2 /*return*/, _c.sent()];
            case 4:
                if (!!chat.threadId) return [3 /*break*/, 7];
                return [4 /*yield*/, gpt_1.default.instance.beta.threads.create()];
            case 5:
                thread = _c.sent();
                threadId = thread.id;
                return [4 /*yield*/, prismaClient_1.default.chat.update({
                        where: {
                            id: id,
                        },
                        data: {
                            threadId: threadId,
                            name: "".concat(name, " vs ").concat(botName),
                        },
                    })];
            case 6: return [2 /*return*/, _c.sent()];
            case 7: return [2 /*return*/, chat];
        }
    });
}); };
var TgBot = /** @class */ (function () {
    function TgBot(bot) {
        var _this = this;
        this.id = bot.id;
        this.instance = new telegraf_1.Telegraf(bot.token);
        this.name = bot.name;
        this.startBotIfActive();
        process.once("SIGINT", function () { return _this.instance.stop("SIGINT"); });
        process.once("SIGTERM", function () { return _this.instance.stop("SIGTERM"); });
        this.instance.on((0, filters_1.message)("text"), function (ctx) { return __awaiter(_this, void 0, void 0, function () {
            var chatId, messageChat, tgUserID, user, fullName, messageText, logMessageFromUser, chat, threadId, chat_1, message_1, modelOverride, result, answer, pricing, answerMessage, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 17, , 19]);
                        chatId = "".concat(ctx.message.chat.id).concat(bot.id);
                        messageChat = ctx.message.chat;
                        tgUserID = ctx.message.from.id;
                        return [4 /*yield*/, findOrCreateUser(tgUserID, messageChat)];
                    case 1:
                        user = _a.sent();
                        fullName = user.fullName;
                        messageText = ctx.message.text;
                        if (!messageText)
                            return [2 /*return*/];
                        logger_1.logger.info("[".concat(fullName, "]: ").concat(messageText));
                        return [4 /*yield*/, this.sendLogMessage("[@".concat(user.name, "]: ").concat(messageText))];
                    case 2:
                        logMessageFromUser = _a.sent();
                        return [4 /*yield*/, ctx.sendChatAction("typing")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, findOrCreateChat({
                                id: chatId,
                                userId: tgUserID,
                                name: user.name || user.username || user.fullName || "Unknown",
                                botName: bot.name,
                                botId: bot.id,
                            })];
                    case 4:
                        chat = _a.sent();
                        threadId = chat.threadId;
                        if (!(messageText === "/start")) return [3 /*break*/, 6];
                        return [4 /*yield*/, ctx.reply(bot.startMessage || "Hi, I'm a bot. How can I help you?")];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                    case 6:
                        if (!(messageText === "/help")) return [3 /*break*/, 8];
                        return [4 /*yield*/, ctx.reply("\n/start - Start the bot\n/help - Show this message\n/refresh - Forget current thread\n            ")];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                    case 8:
                        if (!(messageText === "/refresh")) return [3 /*break*/, 12];
                        return [4 /*yield*/, prismaClient_1.default.chat.findFirst({
                                where: {
                                    id: chatId,
                                },
                            })];
                    case 9:
                        chat_1 = _a.sent();
                        return [4 /*yield*/, prismaClient_1.default.chat.update({
                                where: {
                                    id: chatId,
                                },
                                data: {
                                    threadId: "",
                                },
                            })];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, ctx.reply("success")];
                    case 11:
                        _a.sent();
                        return [2 /*return*/];
                    case 12: return [4 /*yield*/, prismaClient_1.default.message.create({
                            data: {
                                chatId: chatId,
                                tgUserId: user.id,
                                text: messageText,
                                price: 0, // User messages have no cost
                                createdAt: new Date(),
                            },
                        })];
                    case 13:
                        message_1 = _a.sent();
                        modelOverride = bot.model || "gpt-4o-mini";
                        return [4 /*yield*/, (0, getAnswer_1.default)(bot.assistantId, threadId || "", messageText, modelOverride // Pass the model override
                            )];
                    case 14:
                        result = _a.sent();
                        answer = result.answer;
                        pricing = result.pricing;
                        logger_1.logger.info("[".concat(bot.name, "]: ").concat(answer));
                        if (pricing) {
                            logger_1.logger.info("[".concat(bot.name, "] Cost: $").concat(pricing.totalCost.toFixed(6), " (").concat(pricing.inputTokens, " input + ").concat(pricing.outputTokens, " output tokens)"));
                        }
                        return [4 /*yield*/, prismaClient_1.default.message.create({
                                data: {
                                    chatId: chatId,
                                    botId: bot.id,
                                    text: answer,
                                    price: pricing ? pricing.totalCost : 0,
                                    createdAt: new Date(),
                                },
                            })];
                    case 15:
                        answerMessage = _a.sent();
                        return [4 /*yield*/, ctx.reply(answer)];
                    case 16:
                        _a.sent();
                        this.sendLogMessage(answer, logMessageFromUser === null || logMessageFromUser === void 0 ? void 0 : logMessageFromUser.message_id);
                        return [3 /*break*/, 19];
                    case 17:
                        e_1 = _a.sent();
                        // eslint-disable-next-line no-console
                        console.error(e_1);
                        return [4 /*yield*/, ctx.reply(bot.errorMessage || "Sorry, error occurred. Please try again later.")];
                    case 18:
                        _a.sent();
                        if (e_1 instanceof Error) {
                            console.error(e_1.message);
                            this.sendLogMessage("".concat(e_1.name, "\n------------\n").concat(e_1.message, "\n------------\n").concat(e_1.stack));
                        }
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                }
            });
        }); });
    }
    TgBot.prototype.sendLogMessage = function (message, replyToMessageId) {
        return __awaiter(this, void 0, void 0, function () {
            var chatId;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, prismaClient_1.default.setting.findUnique({
                            where: { id: "telegramLogChatId" },
                        })];
                    case 1:
                        chatId = (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.value;
                        if (!chatId)
                            return [2 /*return*/];
                        // eslint-disable-next-line consistent-return
                        // return sendMessage(message, token, chatId);
                        try {
                            return [2 /*return*/, this.instance.telegram.sendMessage(chatId, message, {
                                    reply_to_message_id: replyToMessageId,
                                })];
                        }
                        catch (e) {
                            console.error(e);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TgBot.prototype.startBotIfActive = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prismaClient_1.default.bot.findUnique({
                            where: { id: this.id },
                        })];
                    case 1:
                        bot = _a.sent();
                        // actually not possible
                        if (!bot) {
                            throw new Error("Bot with id ".concat(this.id, " not found"));
                        }
                        if (bot.isActive) {
                            this.startBot();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TgBot.prototype.startBot = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.instance
                            .launch()
                            .then(function () { })
                            .catch(function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // eslint-disable-next-line no-console
                                        console.error(e);
                                        return [4 /*yield*/, prismaClient_1.default.bot.update({
                                                where: {
                                                    id: this.id,
                                                },
                                                data: {
                                                    enabled: false,
                                                    error: JSON.stringify(e.message),
                                                },
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, false];
                                }
                            });
                        }); });
                        return [4 /*yield*/, prismaClient_1.default.bot.update({
                                where: {
                                    id: this.id,
                                },
                                data: {
                                    enabled: true,
                                },
                            })];
                    case 1:
                        _a.sent();
                        logger_1.logger.info("Bot [".concat(this.name, "] started"));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    TgBot.prototype.stopBot = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            this.instance.stop();
                        }
                        catch (e) {
                            console.error(e);
                        }
                        return [4 /*yield*/, prismaClient_1.default.bot.update({
                                where: {
                                    id: this.id,
                                },
                                data: {
                                    enabled: false,
                                },
                            })];
                    case 1:
                        _a.sent();
                        logger_1.logger.info("Bot [".concat(this.name, "] stopped"));
                        return [2 /*return*/];
                }
            });
        });
    };
    TgBot.prototype.sendMessage = function (chatId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.instance.telegram.sendMessage(chatId, message)];
            });
        });
    };
    return TgBot;
}());
exports.TgBot = TgBot;
