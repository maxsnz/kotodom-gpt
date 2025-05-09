import * as dotenv from "dotenv";
import "./utils/bigIntToJson";
import Koa from "koa";
import Router from "@koa/router";
import { koaBody } from "koa-body";
import { version } from "../package.json";
import { startBot, stopBot, sendMessage } from "./controllers/bots";
import setupAdmin from "./admin";
import { requireAdmin } from "./admin/authMiddleware";
import { getMessages } from "./controllers/messages";

dotenv.config();

const webServer = new Koa();
const router = new Router();
webServer.keys = [process.env.COOKIE_SECRET as string];

await setupAdmin(webServer);

// just for debugging
router.get("/api/test", (ctx) => {
  ctx.body = { success: true, version };
});

webServer.use(router.routes()).use(router.allowedMethods());

router.get("/admin/api/messages/:chatId", requireAdmin, getMessages);
router.get("/admin/api/startBot/:id", requireAdmin, startBot);
router.get("/admin/api/stopBot/:id", requireAdmin, stopBot);
router.post(
  "/admin/api/message",
  koaBody({ json: true }),
  requireAdmin,
  sendMessage,
);

webServer.listen(process.env.SERVER_PORT, () => {
  console.log(
    `http://localhost:${process.env.SERVER_PORT || ""}/admin`,
  );
});
