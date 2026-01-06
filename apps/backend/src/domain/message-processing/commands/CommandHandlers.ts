import { CommandHandler } from "./CommandHandler";
import { IncomingContext, GenerationResult } from "../MessageProcessor";
import { ChatRepository } from "../../chats/ChatRepository";

const DEFAULT_HELP_TEXT = [
  "/start - Start the bot",
  "/help - Show this message",
  "/refresh - Forget current thread",
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

/**
 * Handler for /refresh command
 */
export class RefreshCommandHandler implements CommandHandler {
  constructor(private readonly chatRepository: ChatRepository) {}

  canHandle(command: string): boolean {
    return command === "/refresh";
  }

  async handle(ctx: IncomingContext): Promise<GenerationResult> {
    ctx.chat.setThreadId(null);
    await this.chatRepository.save(ctx.chat);

    return {
      bot: ctx.bot,
      chat: ctx.chat,
      userMessage: ctx.userMessage,
      responseText: "success",
      pricing: null,
    };
  }
}

