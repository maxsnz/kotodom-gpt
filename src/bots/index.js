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
exports.BotsManager = void 0;
var prismaClient_1 = require("../prismaClient");
var bot_1 = require("./bot");
var BotsManager = /** @class */ (function () {
    function BotsManager() {
        this.bots = {};
        this.initAll();
    }
    BotsManager.prototype.initAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var botsData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prismaClient_1.default.bot.findMany({
                            where: {},
                        })];
                    case 1:
                        botsData = _a.sent();
                        botsData.forEach(function (bot) {
                            var tgBot = new bot_1.TgBot(bot);
                            _this.bots[bot.id] = tgBot;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    BotsManager.prototype.initById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var bot, botData, tgBot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bots[id];
                        if (bot)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, prismaClient_1.default.bot.findUnique({
                                where: { id: id },
                            })];
                    case 1:
                        botData = _a.sent();
                        if (!botData) {
                            throw new Error("Bot with id ".concat(id, " not found"));
                            return [2 /*return*/, false];
                        }
                        tgBot = new bot_1.TgBot(botData);
                        this.bots[id] = tgBot;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    BotsManager.prototype.startById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var bot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bots[id];
                        if (!bot) return [3 /*break*/, 2];
                        return [4 /*yield*/, bot.startBot()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        console.error("Bot with id ".concat(id, " not found"));
                        return [2 /*return*/, false];
                }
            });
        });
    };
    BotsManager.prototype.stopById = function (id) {
        var bot = this.bots[id];
        if (bot) {
            bot.stopBot();
            return true;
        }
        else {
            console.error("Bot with id ".concat(id, " not found"));
            return false;
        }
    };
    BotsManager.prototype.sendMessage = function (_a) {
        var botId = _a.botId, chatId = _a.chatId, message = _a.message;
        var bot = this.bots[botId];
        if (bot) {
            var botIdStr = botId.toString();
            var botIdLength = botIdStr.length;
            var id = chatId.slice(0, -botIdLength);
            return bot.sendMessage(id, message);
        }
    };
    return BotsManager;
}());
exports.BotsManager = BotsManager;
var botsManager = new BotsManager();
exports.default = botsManager;
