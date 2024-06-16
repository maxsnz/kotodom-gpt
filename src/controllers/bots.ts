import { ContextWithSession } from "koa";
import prisma from "../prismaClient";
import botsManager from "../bots";

export const startBot = async (ctx: ContextWithSession) => {
  const adminUser = await prisma.setting.findUnique({
    where: { id: "adminUser" },
  });
  if (!adminUser) {
    ctx.status = 500;
    console.error("adminUser not found");
    return;
  }

  try {
    if (ctx.session.adminUser?.email !== adminUser.value) {
      throw Error("Unauthorized");
    }

    if (!ctx.params.id) {
      throw Error("No bot id provided");
    }

    const botId = parseInt(ctx.params.id);
    if (!botId) {
      throw Error("Invalid bot id");
    }

    botsManager.startById(botId);

    ctx.body = JSON.stringify({});
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};

export const stopBot = async (ctx: ContextWithSession) => {
  const adminUser = await prisma.setting.findUnique({
    where: { id: "adminUser" },
  });
  if (!adminUser) {
    ctx.status = 500;
    console.error("adminUser not found");
    return;
  }

  try {
    if (ctx.session.adminUser?.email !== adminUser.value) {
      throw Error("Unauthorized");
    }

    if (!ctx.params.id) {
      throw Error("No bot id provided");
    }

    const botId = parseInt(ctx.params.id);
    if (!botId) {
      throw Error("Invalid bot id");
    }

    botsManager.stopById(botId);

    ctx.body = JSON.stringify({});
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};
