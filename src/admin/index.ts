import AdminJS from "adminjs";
import Koa from "koa";
// @ts-expect-error
import AdminJSKoa from "@adminjs/koa";
// @ts-expect-error
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import Components, { componentLoader } from "./components";
import { createSettingResource } from "./resources/settingResource";
import { createUserResource } from "./resources/userResource";
import { createBotResource } from "./resources/botResource";
import { createChatResource } from "./resources/chatResource";
import { createMessageResource } from "./resources/messageResource";
import authenticate from "./authenticate";

const setupAdmin = async (app: Koa): Promise<void> => {
  AdminJS.registerAdapter({ Database, Resource });

  const adminJs = new AdminJS({
    dashboard: {
      component: Components.Dashboard,
    },
    resources: [
      createSettingResource(),
      createUserResource(),
      createBotResource(),
      createChatResource(),
      createMessageResource(),
    ],
    componentLoader,
  });

  const adminRouter = AdminJSKoa.buildAuthenticatedRouter(
    adminJs,
    app,
    {
      authenticate,
      sessionOptions: {
        httpOnly: process.env.NODE_ENV === "production",
        renew: true,
        secure: process.env.NODE_ENV === "production",
      },
    },
  );

  app.use(adminRouter.routes()).use(adminRouter.allowedMethods());

  adminJs.watch();
};

export default setupAdmin;
