import * as dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import gpt from "../gpt";
import getAnswer from "../gpt/getAnswer";
import getCurrentTime from "../utils/getCurrentTime";
import prisma from "../prismaClient";
import { Bot } from "@prisma/client";
dotenv.config();

interface MessageChat {
  first_name?: string;
  last_name?: string;
  username: string;
}

const getUserName = (messageChat: MessageChat) => {
  let username = "";
  const { first_name, last_name } = messageChat;
  if (messageChat.first_name) {
    // username = `${username} ${chat.first_name}`;
    username = `${first_name}`;
  }
  if (last_name) {
    username =
      username.length > 0
        ? `${username} ${last_name}`
        : `${last_name}`;
  }

  if (!first_name && !last_name) {
    username = "Инкогнито";
  }

  return username;
};

const findOrCreateUser = async (
  id: number,
  messageChat: MessageChat,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    const fullName = getUserName(messageChat);
    return await prisma.user.create({
      data: {
        id,
        username: messageChat.username,
        fullName,
        createdAt: new Date(),
      },
    });
  }

  return user;
};

const findOrCreateChat = async (id: string, userId: number) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id,
    },
  });

  if (!chat) {
    const thread = await gpt.instance.beta.threads.create();
    const threadId = thread.id;

    return await prisma.chat.create({
      data: {
        id,
        createdAt: new Date(),
        userId,
        threadId,
      },
    });
  }

  return chat;
};

export class TgBot {
  id: number;
  instance: Telegraf;
  name: string;

  constructor(bot: Bot) {
    this.id = bot.id;
    this.instance = new Telegraf(bot.token);
    this.name = bot.name;

    this.startBotIfActive();

    process.once("SIGINT", () => this.instance.stop("SIGINT"));
    process.once("SIGTERM", () => this.instance.stop("SIGTERM"));

    this.instance.on(message("text"), async (ctx) => {
      try {
        // chatId contains both chatId (which is same as userId) and botId
        const chatId = `${ctx.message.chat.id}${bot.id}`;

        const messageChat = ctx.message.chat as MessageChat;
        const tgUserID = ctx.message.from.id;
        const user = await findOrCreateUser(tgUserID, messageChat);
        const fullName = user.fullName;
        const messageText = ctx.message.text;
        // console.log("ctx.message", ctx.message);

        if (!messageText) return;
        console.log("-------------------");
        console.log(`${getCurrentTime()}`);
        console.log(`[${fullName}]: ${messageText}`);

        await ctx.sendChatAction("typing");

        const chat = await findOrCreateChat(chatId, tgUserID);
        let threadId = chat.threadId;

        const message = await prisma.message.create({
          data: {
            chatId,
            userId: user.id,
            text: messageText,
            createdAt: new Date(),
          },
        });

        if (messageText === "/start") {
          await ctx.reply(
            bot.startMessage || "Hi, I'm a bot. How can I help you?",
          );
          return;
        }

        const answer = await getAnswer(
          bot.assistantId,
          threadId,
          messageText,
        );
        console.log(`[${bot.name}]: ${answer}`);

        const answerMessage = await prisma.message.create({
          data: {
            chatId,
            botId: bot.id,
            text: answer,
            createdAt: new Date(),
          },
        });

        await ctx.reply(answer);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        await ctx.reply(
          bot.errorMessage ||
            "Sorry, error occurred. Please try again later.",
        );
      }
    });
  }

  async startBotIfActive() {
    const bot = await prisma.bot.findUnique({
      where: { id: this.id },
    });

    // actually not possible
    if (!bot) {
      throw new Error(`Bot with id ${this.id} not found`);
    }

    if (bot.isActive) {
      this.startBot();
    }
  }

  async startBot() {
    this.instance
      .launch()
      .then(() => {})
      .catch(async (e) => {
        // eslint-disable-next-line no-console
        console.error(e);

        await prisma.bot.update({
          where: {
            id: this.id,
          },
          data: {
            isStarted: false,
            error: JSON.stringify(e.message),
          },
        });

        return false;
      });

    await prisma.bot.update({
      where: {
        id: this.id,
      },
      data: {
        isStarted: true,
      },
    });

    console.log(`Bot [${this.name}] started`);

    return true;
  }

  async stopBot() {
    try {
      this.instance.stop();
    } catch (e) {
      console.error(e);
    }

    await prisma.bot.update({
      where: {
        id: this.id,
      },
      data: {
        isStarted: false,
      },
    });

    console.log(`Bot [${this.name}] stopped`);
  }
}
