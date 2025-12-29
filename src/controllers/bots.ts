import { Context } from "koa";
import prisma from "../prismaClient";
import botsManager from "../bots";

export const startBot = async (ctx: Context) => {
  try {
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

export const stopBot = async (ctx: Context) => {
  try {
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

export const sendMessage = async (ctx: Context) => {
  try {
    if (!("request" in ctx) || !("body" in ctx.request)) {
      throw new Error("Invalid request");
    }

    const { chatId, botId, message } = ctx.request.body as {
      chatId?: string;
      botId?: number;
      message?: string;
    };

    if (!chatId) {
      throw Error("No chatId provided");
    }

    if (!botId || typeof botId !== "number") {
      throw Error("No botId provided");
    }

    if (!message) {
      throw Error("No message provided");
    }

    const result = await botsManager.sendMessage({
      botId,
      chatId,
      message,
    });

    // Save the admin message to the database
    await prisma.message.create({
      data: {
        chatId,
        botId,
        text: message,
        price: 0, // Admin messages have no cost
        createdAt: new Date(),
        tgUserId: null,
      },
    });

    ctx.body = JSON.stringify({ ok: true });
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};
