import { Module, forwardRef } from "@nestjs/common";

import { ChatRepository } from "../../domain/chats/ChatRepository";
import { MessageRepository } from "../../domain/chats/MessageRepository";
import { MessageProcessingRepository } from "../../domain/chats/MessageProcessingRepository";
import { ChatsService, TelegramClientFactory } from "../../domain/chats/ChatsService";
import { ChatRepositoryPrisma } from "../../infra/db/repositories/ChatRepositoryPrisma";
import { MessageRepositoryPrisma } from "../../infra/db/repositories/MessageRepositoryPrisma";
import { MessageProcessingRepositoryPrisma } from "../../infra/db/repositories/MessageProcessingRepositoryPrisma";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { ChatsAdminController } from "./chats-admin.controller";
import { MessageProcessingAdminController } from "./message-processing-admin.controller";
import { ProcessingRecoveryService } from "./processing-recovery.service";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import { BotsModule } from "../bots/bots.module";
import { BotRepository } from "../../domain/bots/BotRepository";

export const TELEGRAM_CLIENT_FACTORY = "TELEGRAM_CLIENT_FACTORY";

const defaultTelegramClientFactory: TelegramClientFactory = (token: string) =>
  new TelegramClient({ token });

@Module({
  imports: [forwardRef(() => BotsModule)],
  controllers: [
    ChatsAdminController,
    MessageProcessingAdminController,
  ],
  providers: [
    {
      provide: ChatRepository,
      useClass: ChatRepositoryPrisma,
    },
    {
      provide: MessageRepository,
      useClass: MessageRepositoryPrisma,
    },
    {
      provide: MessageProcessingRepository,
      useClass: MessageProcessingRepositoryPrisma,
    },
    {
      provide: TELEGRAM_CLIENT_FACTORY,
      useValue: defaultTelegramClientFactory,
    },
    {
      provide: ChatsService,
      useFactory: (
        chatRepo: ChatRepository,
        messageRepo: MessageRepository,
        botRepo: BotRepository,
        telegramClientFactory: TelegramClientFactory
      ) => new ChatsService(chatRepo, messageRepo, botRepo, telegramClientFactory),
      inject: [ChatRepository, MessageRepository, BotRepository, TELEGRAM_CLIENT_FACTORY],
    },
    ProcessingRecoveryService,
  ],
  exports: [
    ChatRepository,
    MessageRepository,
    MessageProcessingRepository,
    ChatsService,
    ProcessingRecoveryService,
  ],
})
export class ChatsModule {}
