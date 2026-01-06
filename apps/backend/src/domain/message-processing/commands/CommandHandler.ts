import { IncomingContext, GenerationResult } from "../MessageProcessor";

/**
 * Interface for handling bot commands
 */
export interface CommandHandler {
  /**
   * Check if this handler can handle the given command
   */
  canHandle(command: string): boolean;

  /**
   * Handle the command and return a response
   */
  handle(ctx: IncomingContext): Promise<GenerationResult>;
}

/**
 * Registry for command handlers
 */
export class CommandRegistry {
  private handlers: CommandHandler[] = [];

  /**
   * Register a command handler
   */
  register(handler: CommandHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Find handler for a command
   */
  findHandler(command: string): CommandHandler | null {
    return this.handlers.find(handler => handler.canHandle(command)) || null;
  }

  /**
   * Get all registered handlers
   */
  getHandlers(): CommandHandler[] {
    return [...this.handlers];
  }
}

