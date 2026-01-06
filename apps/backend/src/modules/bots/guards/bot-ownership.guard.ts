import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { BotRepository } from "../../../domain/bots/BotRepository";
import { BotPolicy } from "../../../domain/bots/BotPolicy";
import { Bot } from "../../../domain/bots/Bot";

// Extend FastifyRequest to include bot property
declare module "fastify" {
  interface FastifyRequest {
    bot?: Bot;
  }
}

/**
 * Guard that checks if the current user has permission to access a bot
 * Loads the bot from :id param and attaches it to request for controller reuse
 */
@Injectable()
export class BotOwnershipGuard implements CanActivate {
  constructor(
    @Inject(BotRepository)
    private readonly botRepository: BotRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // Extract bot ID from route params
    const botId = (request.params as { id?: string }).id;

    if (!botId) {
      throw new ForbiddenException("Bot ID not provided");
    }

    // Load the bot
    const bot = await this.botRepository.findById(botId);

    if (!bot) {
      throw new NotFoundException(`Bot with id ${botId} not found`);
    }

    // Check ownership using policy
    if (!BotPolicy.canManage(user, bot)) {
      throw new ForbiddenException(
        "You do not have permission to access this bot"
      );
    }

    // Attach bot to request for controller reuse
    request.bot = bot;

    return true;
  }
}

