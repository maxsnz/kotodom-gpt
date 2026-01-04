import { Chat } from "./Chat";
import type { TgUser } from "../../infra/db/prisma/generated/client";

export abstract class ChatRepository {
  abstract findById(id: string): Promise<Chat | null>;
  abstract findByUserId(tgUserId: bigint): Promise<Chat[]>;
  abstract findByBotId(botId: number): Promise<Chat[]>;
  abstract save(chat: Chat): Promise<void>;
  abstract findOrCreateChat(
    chatId: string,
    tgUserId: bigint,
    botId: number
  ): Promise<Chat>;
  abstract findOrCreateUser(
    tgUserId: bigint,
    userData: {
      username?: string;
      firstName?: string;
      lastName?: string;
    }
  ): Promise<TgUser>;
}
