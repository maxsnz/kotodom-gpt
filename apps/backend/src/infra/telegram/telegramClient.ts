import { Telegraf } from "telegraf";

export type TelegramClientConfig = {
  token: string;
};

export type SendMessageInput = {
  chatId: number | string;
  text: string;
  // keep it loose to not fight types now
  extra?: Record<string, unknown>;
};

export type EditMessageTextInput = {
  chatId: number | string;
  messageId: number;
  text: string;
  extra?: Record<string, unknown>;
};

export type DeleteMessageInput = {
  chatId: number | string;
  messageId: number;
};

export type AnswerCallbackQueryInput = {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
};

export class TelegramClient {
  private bot: Telegraf;

  constructor(config: TelegramClientConfig) {
    this.bot = new Telegraf(config.token);
  }

  /**
   * Expose underlying Telegraf instance ONLY if you really need it.
   * Prefer using methods below.
   */
  get raw(): Telegraf {
    return this.bot;
  }

  async sendMessage(input: SendMessageInput): Promise<{ messageId: number }> {
    const res = await this.bot.telegram.sendMessage(
      input.chatId,
      input.text,
      input.extra as any
    );
    return { messageId: (res as any).message_id };
  }

  async editMessageText(input: EditMessageTextInput): Promise<void> {
    await this.bot.telegram.editMessageText(
      input.chatId,
      input.messageId,
      undefined,
      input.text,
      input.extra as any
    );
  }

  async deleteMessage(input: DeleteMessageInput): Promise<void> {
    await this.bot.telegram.deleteMessage(input.chatId, input.messageId);
  }

  async answerCallbackQuery(input: AnswerCallbackQueryInput): Promise<void> {
    await this.bot.telegram.answerCbQuery(input.callbackQueryId, input.text, {
      show_alert: input.showAlert,
    } as any);
  }

  async setWebhook(url: string): Promise<void> {
    await this.bot.telegram.setWebhook(url);
  }

  async removeWebhook(): Promise<void> {
    await this.bot.telegram.deleteWebhook();
  }
}
