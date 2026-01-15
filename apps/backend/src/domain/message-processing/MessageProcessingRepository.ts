import {
  MessageProcessing,
  MessageProcessingStatus,
} from "./MessageProcessing";

export abstract class MessageProcessingRepository {
  abstract getOrCreateForUserMessage(
    userMessageId: number
  ): Promise<MessageProcessing>;

  abstract markProcessing(userMessageId: number): Promise<void>;

  abstract markFailed(userMessageId: number, error: string): Promise<void>;

  abstract markTerminal(userMessageId: number, reason: string): Promise<void>;

  abstract markResponseGenerated(
    userMessageId: number,
    responseMessageId: number,
    price?: import("@prisma/client/runtime/client").Decimal,
    rawResponse?: unknown
  ): Promise<void>;

  abstract markResponseSent(
    userMessageId: number,
    telegramOutgoingMessageId?: number
  ): Promise<void>;

  abstract markCompleted(userMessageId: number): Promise<void>;

  abstract findByUserMessageId(
    userMessageId: number
  ): Promise<MessageProcessing | null>;

  abstract findFailed(limit?: number): Promise<MessageProcessing[]>;

  abstract updateTelegramIds(
    userMessageId: number,
    telegramIncomingMessageId?: number,
    telegramUpdateId?: bigint
  ): Promise<void>;

  abstract findAll(
    filters?: {
      status?: MessageProcessingStatus | MessageProcessingStatus[];
      userMessageId?: number;
    },
    pagination?: {
      skip?: number;
      take?: number;
    }
  ): Promise<MessageProcessing[]>;

  abstract findById(id: number): Promise<MessageProcessing | null>;
}
