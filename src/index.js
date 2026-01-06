"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
require("./utils/bigIntToJson");
var koa_1 = require("koa");
var router_1 = require("@koa/router");
var koa_body_1 = require("koa-body");
var package_json_1 = require("../package.json");
var bots_1 = require("./controllers/bots");
var authMiddleware_1 = require("./admin-old/authMiddleware");
var messages_1 = require("./controllers/messages");
var logger_1 = require("./utils/logger");
dotenv.config();
var webServer = new koa_1.default();
var router = new router_1.default();
webServer.keys = [process.env.COOKIE_SECRET];
// just for debugging
router.get("/api/test", function (ctx) {
    ctx.body = { success: true, version: package_json_1.version };
});
webServer.use(router.routes()).use(router.allowedMethods());
router.get("/admin/api/messages/:chatId", authMiddleware_1.requireAdmin, messages_1.getMessages);
router.get("/admin/api/users/:userId/chats", authMiddleware_1.requireAdmin, messages_1.getUserChats);
router.get("/admin/api/startBot/:id", authMiddleware_1.requireAdmin, bots_1.startBot);
router.get("/admin/api/stopBot/:id", authMiddleware_1.requireAdmin, bots_1.stopBot);
router.post("/admin/api/message", (0, koa_body_1.koaBody)({ json: true }), authMiddleware_1.requireAdmin, bots_1.sendMessage);
webServer.listen(process.env.SERVER_PORT, function () {
    logger_1.logger.info("http://localhost:".concat(process.env.SERVER_PORT || "", "/admin"));
});
