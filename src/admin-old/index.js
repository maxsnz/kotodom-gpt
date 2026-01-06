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
var adminjs_1 = require("adminjs");
var koa_1 = require("@adminjs/koa");
var prisma_1 = require("@adminjs/prisma");
var components_1 = require("./components");
var settingResource_1 = require("./resources/settingResource");
var userResource_1 = require("./resources/userResource");
var botResource_1 = require("./resources/botResource");
var chatResource_1 = require("./resources/chatResource");
var messageResource_1 = require("./resources/messageResource");
var authenticate_1 = require("./authenticate");
var setupAdmin = function (app) { return __awaiter(void 0, void 0, void 0, function () {
    var adminJs, adminRouter;
    return __generator(this, function (_a) {
        adminjs_1.default.registerAdapter({ Database: prisma_1.Database, Resource: prisma_1.Resource });
        adminJs = new adminjs_1.default({
            dashboard: {
                component: components_1.default.Dashboard,
            },
            resources: [
                (0, settingResource_1.createSettingResource)(),
                (0, userResource_1.createUserResource)(),
                (0, botResource_1.createBotResource)(),
                (0, chatResource_1.createChatResource)(),
                (0, messageResource_1.createMessageResource)(),
            ],
            componentLoader: components_1.componentLoader,
        });
        adminRouter = koa_1.default.buildAuthenticatedRouter(adminJs, app, {
            authenticate: authenticate_1.default,
            sessionOptions: {
                httpOnly: process.env.NODE_ENV === "production",
                renew: true,
                secure: process.env.NODE_ENV === "production",
            },
        });
        app.use(adminRouter.routes()).use(adminRouter.allowedMethods());
        adminJs.watch();
        return [2 /*return*/];
    });
}); };
exports.default = setupAdmin;
