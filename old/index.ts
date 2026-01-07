import * as dotenv from "dotenv";
import "./utils/bigIntToJson";
import Koa from "koa";
import Router from "@koa/router";
import { koaBody } from "koa-body";
import { version } from "../package.json";
import { startBot, stopBot, sendMessage } from "./controllers/bots";
import { requireAdmin } from "./admin-old/authMiddleware";
import { getMessages, getUserChats } from "./controllers/messages";
import { logger } from "./utils/logger";

dotenv.config();

const webServer = new Koa();
const router = new Router();
webServer.keys = [process.env.COOKIE_SECRET as string];

// just for debugging
router.get("/api/test", (ctx) => {
  ctx.body = { success: true, version };
});

webServer.use(router.routes()).use(router.allowedMethods());

router.get("/admin/api/messages/:chatId", requireAdmin, getMessages);
router.get("/admin/api/users/:userId/chats", requireAdmin, getUserChats);
router.get("/admin/api/startBot/:id", requireAdmin, startBot);
router.get("/admin/api/stopBot/:id", requireAdmin, stopBot);
router.post(
  "/admin/api/message",
  koaBody({ json: true }),
  requireAdmin,
  sendMessage
);

webServer.listen(process.env.BACKEND_PORT, () => {
  logger.info(`http://localhost:${process.env.BACKEND_PORT || ""}/admin`);
});
