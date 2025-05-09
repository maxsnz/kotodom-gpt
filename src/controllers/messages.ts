import { Context } from "koa";
import prisma from "../prismaClient";

export const getMessages = async (ctx: Context) => {
  try {
    const { chatId } = ctx.params;
    if (!chatId) {
      throw Error("No chatId provided");
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
    });

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        bot: true,
        user: true,
      },
    });
    const bot = chat?.bot;
    const user = chat?.user;

    if (!bot) {
      throw Error("Bot not found");
    }

    if (!user) {
      throw Error("User not found");
    }

    ctx.body = JSON.stringify({
      messages: messages.map((message) => ({
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        isUser: !!message.userId,
      })),
      bot: {
        id: bot.id,
        name: bot.name,
      },
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};
