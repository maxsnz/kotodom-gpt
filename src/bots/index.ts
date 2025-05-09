import prisma from "../prismaClient";
import { TgBot } from "./bot";

interface BotsStore {
  [key: number]: TgBot;
}

export class BotsManager {
  bots: BotsStore;

  constructor() {
    this.bots = {};

    this.initAll();
  }

  async initAll() {
    const botsData = await prisma.bot.findMany({
      where: {},
    });

    botsData.forEach((bot) => {
      const tgBot = new TgBot(bot);
      this.bots[bot.id] = tgBot;
    });
  }

  async initById(id: number) {
    const bot = this.bots[id];
    if (bot) return false;

    const botData = await prisma.bot.findUnique({
      where: { id },
    });

    if (!botData) {
      throw new Error(`Bot with id ${id} not found`);
      return false;
    }

    const tgBot = new TgBot(botData);
    this.bots[id] = tgBot;

    return true;
  }

  async startById(id: number) {
    const bot = this.bots[id];
    if (bot) {
      return await bot.startBot();
    } else {
      console.error(`Bot with id ${id} not found`);
      return false;
    }
  }

  stopById(id: number) {
    const bot = this.bots[id];

    if (bot) {
      bot.stopBot();
      return true;
    } else {
      console.error(`Bot with id ${id} not found`);
      return false;
    }
  }

  sendMessage({
    botId,
    chatId,
    message,
  }: {
    botId: number;
    chatId: string;
    message: string;
  }) {
    const bot = this.bots[botId];
    if (bot) {
      const botIdStr = botId.toString();
      const botIdLength = botIdStr.length;
      const id = chatId.slice(0, -botIdLength);

      return bot.sendMessage(id, message);
    }
  }
}

const botsManager = new BotsManager();

export default botsManager;
