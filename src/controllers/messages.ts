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
        tgUser: true,
      },
    });
    const bot = chat?.bot;
    const tgUser = chat?.tgUser;

    if (!bot) {
      throw Error("Bot not found");
    }

    if (!tgUser) {
      throw Error("TgUser not found");
    }

    ctx.body = JSON.stringify({
      messages: messages.map((message) => ({
        id: message.id,
        text: message.text,
        createdAt: message.createdAt,
        isUser: !!message.tgUserId,
        price: message.price,
      })),
      bot: {
        id: bot.id,
        name: bot.name,
      },
      user: {
        id: tgUser.id,
        name: tgUser.username,
        username: tgUser.username,
      },
    });
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};

export const getUserChats = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;
    if (!userId) {
      throw Error("No userId provided");
    }

    const tgUser = await prisma.tgUser.findUnique({
      where: {
        id: BigInt(userId),
      },
    });

    if (!tgUser) {
      throw Error("TgUser not found");
    }

    const chats = await prisma.chat.findMany({
      where: {
        tgUserId: BigInt(userId),
      },
      include: {
        bot: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    ctx.body = JSON.stringify({
      chats: chats.map((chat) => ({
        id: chat.id,
        name: chat.name,
        createdAt: chat.createdAt,
        bot: chat.bot
          ? {
              id: chat.bot.id,
              name: chat.bot.name,
            }
          : null,
        messagesCount: chat._count.messages,
      })),
      user: {
        id: tgUser.id.toString(),
        username: tgUser.username || tgUser.name || tgUser.fullName,
      },
    });
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};
