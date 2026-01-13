import { CommandHandler } from "./CommandHandler";
import { IncomingContext, GenerationResult } from "../MessageProcessor";
import { ChatRepository } from "../../chats/ChatRepository";

const DEFAULT_HELP_TEXT = [
  "/start - Start the bot",
  "/help - Show this message",
].join("\n");

/**
 * Handler for /start command
 */
export class StartCommandHandler implements CommandHandler {
  canHandle(command: string): boolean {
    return command === "/start";
  }

  async handle(ctx: IncomingContext): Promise<GenerationResult> {
    return {
      bot: ctx.bot,
      chat: ctx.chat,
      userMessage: ctx.userMessage,
      responseText: ctx.bot.startMessage,
      pricing: null,
    };
  }
}

/**
 * Handler for /help command
 */
export class HelpCommandHandler implements CommandHandler {
  canHandle(command: string): boolean {
    return command === "/help";
  }

  async handle(ctx: IncomingContext): Promise<GenerationResult> {
    return {
      bot: ctx.bot,
      chat: ctx.chat,
      userMessage: ctx.userMessage,
      responseText: DEFAULT_HELP_TEXT,
      pricing: null,
    };
  }
}
