import { OpenAIClient } from "../../infra/openai/openaiClient";
import { ChatRepository } from "../chats/ChatRepository";
import {
  IncomingContext,
  GenerationResult,
  ResponseGenerator,
} from "./MessageProcessor";
import { CommandRegistry } from "./commands/CommandHandler";
import {
  StartCommandHandler,
  HelpCommandHandler,
} from "./commands/CommandHandlers";

/**
 * Responsible for generating responses to user messages.
 * Handles both commands and AI-powered responses.
 */
export class DefaultResponseGenerator implements ResponseGenerator {
  private commandRegistry: CommandRegistry;

  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly chatRepository: ChatRepository
  ) {
    this.commandRegistry = new CommandRegistry();
    this.registerCommandHandlers();
  }

  private registerCommandHandlers(): void {
    this.commandRegistry.register(new StartCommandHandler());
    this.commandRegistry.register(new HelpCommandHandler());
  }

  async generateResponse(
    ctx: IncomingContext,
    botId: number | null
  ): Promise<GenerationResult> {
    const userMessage = ctx.userMessage;
    const chat = ctx.chat;
    const bot = ctx.bot;

    const text = userMessage.text;
    const trimmed = text.trim();

    // Try to handle as command first
    const commandHandler = this.commandRegistry.findHandler(trimmed);
    if (commandHandler) {
      return commandHandler.handle(ctx);
    }

    // AI-powered response
    const openAiResult = await this.openAIClient.getAnswer({
      prompt: bot.prompt,
      messageText: text,
      model: bot.model,
    });

    // Responses API is stateless - no need to save threadId
    await this.chatRepository.save(chat);

    return {
      bot,
      chat,
      userMessage,
      responseText: openAiResult.answer,
      pricing: openAiResult.pricing,
    };
  }
}
