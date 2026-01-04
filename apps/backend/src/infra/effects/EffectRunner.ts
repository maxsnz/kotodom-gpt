import { Injectable, Logger } from "@nestjs/common";

import type { Effect } from "../../domain/effects/Effect";
import { TelegramClient } from "../telegram/telegramClient";
import { PgBossClient } from "../jobs/pgBoss";

@Injectable()
export class EffectRunner {
  private readonly logger = new Logger(EffectRunner.name);

  constructor(
    private readonly telegram: TelegramClient,
    private readonly boss: PgBossClient
  ) {}

  async runAll(effects: Effect[]): Promise<void> {
    // MVP: sequential execution keeps ordering deterministic and logs readable
    for (const effect of effects) {
      await this.run(effect);
    }
  }

  async run(effect: Effect): Promise<void> {
    switch (effect.type) {
      case "telegram.ensureWebhook": {
        await this.telegram.ensureWebhook(effect.botId);
        return;
      }

      case "jobs.publish": {
        await this.boss.publish(
          effect.name,
          effect.payload as object,
          effect.options
        );
        return;
      }

      default: {
        // Exhaustiveness guard (will error at compile time if Effect is properly discriminated)
        this.assertNever(effect);
      }
    }
  }

  private assertNever(x: never): never {
    // Runtime fallback if Effect is widened to `any`
    this.logger.error(`Unknown effect: ${JSON.stringify(x)}`);
    throw new Error("Unknown effect type");
  }
}
