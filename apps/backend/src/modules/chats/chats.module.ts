import { Module, forwardRef } from "@nestjs/common";

import { ChatRepository } from "../../domain/chats/ChatRepository";
import { MessageRepository } from "../../domain/chats/MessageRepository";
import {
  ChatsService,
  TelegramClientFactory,
} from "../../domain/chats/ChatsService";
import { ChatRepositoryPrisma } from "../../infra/db/repositories/ChatRepositoryPrisma";
import { MessageRepositoryPrisma } from "../../infra/db/repositories/MessageRepositoryPrisma";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { ChatsAdminController } from "./chats-admin.controller";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import { BotsModule } from "../bots/bots.module";
import { BotRepository } from "../../domain/bots/BotRepository";

export const TELEGRAM_CLIENT_FACTORY = "TELEGRAM_CLIENT_FACTORY";

const defaultTelegramClientFactory: TelegramClientFactory = (token: string) =>
  new TelegramClient({ token });

@Module({
  imports: [forwardRef(() => BotsModule)],
  controllers: [ChatsAdminController],
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
      ) =>
        new ChatsService(chatRepo, messageRepo, botRepo, telegramClientFactory),
      inject: [
        ChatRepository,
        MessageRepository,
        BotRepository,
        TELEGRAM_CLIENT_FACTORY,
      ],
    },
  ],
  exports: [ChatRepository, MessageRepository, ChatsService],
})
export class ChatsModule {}
