import type * as runtime from "@prisma/client/runtime/client";

import { Message } from "./Message";

type Decimal = runtime.Decimal;

export type CreateUserMessageInput = {
  chatId: string;
  tgUserId: bigint;
  botId: number | null; // null for user messages, number for bot messages
  text: string;
  telegramUpdateId: bigint;
};

export type CreateBotMessageInput = {
  chatId: string;
  botId: number;
  text: string;
  price: Decimal;
  userMessageId: number;
};

export type CreateAdminMessageInput = {
  chatId: string;
  botId: number;
  text: string;
};

export abstract class MessageRepository {
  abstract findByTelegramUpdate(
    botId: number,
    telegramUpdateId: number
  ): Promise<Message | null>;
  abstract findUserMessageByTelegramUpdate(
    botId: number,
    telegramUpdateId: number
  ): Promise<Message | null>;
  abstract findBotResponseForUserMessage(
    userMessageId: number
  ): Promise<Message | null>;
  abstract findByChatId(chatId: string): Promise<Message[]>;
  abstract findById(id: number): Promise<Message | null>;
  abstract findAll(): Promise<Message[]>;
  abstract save(message: Message): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract createUserMessage(input: CreateUserMessageInput): Promise<Message>;
  abstract createBotMessage(input: CreateBotMessageInput): Promise<Message>;
  abstract createAdminMessage(input: CreateAdminMessageInput): Promise<Message>;
}
