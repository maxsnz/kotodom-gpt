import { Bot } from "./Bot";

export type CreateBotData = {
  name: string;
  startMessage: string;
  errorMessage: string;
  model: string;
  assistantId: string;
  token: string;
  telegramMode: "webhook" | "polling";
  ownerUserId?: string | null;
};

export abstract class BotRepository {
  abstract findById(id: string): Promise<Bot | null>;
  abstract findAll(): Promise<Bot[]>;
  abstract findByOwner(ownerUserId: string): Promise<Bot[]>;
  abstract findPollingBots(): Promise<Bot[]>;
  abstract findWebhookBots(): Promise<Bot[]>;
  abstract create(data: CreateBotData): Promise<Bot>;
  abstract save(bot: Bot): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
