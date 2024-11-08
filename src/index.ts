import * as dotenv from "dotenv";
import "./utils/bigIntToJson";
import Koa from "koa";
import Router from "@koa/router";
import AdminJS from "adminjs";
// @ts-ignore-next-line
import AdminJSKoa from "@adminjs/koa";
// @ts-ignore-next-line
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import botsManager from "./bots";
import { version } from "../package.json";
import prisma from "./prismaClient";
import authenticate from "./authenticate";
import { startBot, stopBot } from "./controllers/bots";
import { Bot } from "@prisma/client";
import { adminOptions } from "./admin";

dotenv.config();

const webServer = new Koa();
const router = new Router();
webServer.keys = [process.env.COOKIE_SECRET as string];

AdminJS.registerAdapter({ Database, Resource });

const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSKoa.buildAuthenticatedRouter(
  admin,
  webServer,
  {
    authenticate,
    sessionOptions: {
      httpOnly: process.env.NODE_ENV === "production",
      renew: true,
      secure: process.env.NODE_ENV === "production",
    },
  },
);

// just for debugging
router.get("/api/test", (ctx) => {
  ctx.body = { success: true, version };
});

webServer.use(router.routes()).use(router.allowedMethods());
webServer.use(adminRouter.routes()).use(adminRouter.allowedMethods());

router.get("/admin/api/startBot/:id", startBot);
router.get("/admin/api/stopBot/:id", stopBot);

webServer.listen(process.env.SERVER_PORT, () => {
  console.log(
    `http://localhost:${process.env.SERVER_PORT || ""}/admin`,
  );
});
