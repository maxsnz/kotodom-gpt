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
        price: message.price,
      })),
      bot: {
        id: bot.id,
        name: bot.name,
      },
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
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

    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId),
      },
    });

    if (!user) {
      throw Error("User not found");
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: BigInt(userId),
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
        id: user.id.toString(),
        username: user.username || user.name || user.fullName,
      },
    });
  } catch (e) {
    console.error(e);
    ctx.status = 403;
    ctx.body = { error: JSON.stringify(e) };
  }
};
