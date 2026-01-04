import { Bot } from "./Bot";

export abstract class BotRepository {
  abstract findById(id: string): Promise<Bot | null>;
  abstract save(bot: Bot): Promise<void>;
  abstract findPollingBots(): Promise<Bot[]>;
}
