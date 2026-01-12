import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { LoggerModule } from "./infra/logger";
import { BotsModule } from "./modules/bots/bots.module";
import { ChatsModule } from "./modules/chats/chats.module";
import { MessageProcessingModule } from "./modules/message-processing/message-processing.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { TgUsersModule } from "./modules/tg-users/tg-users.module";
import { SettingsModule } from "./modules/settings/settings.module";

@Module({
  imports: [
    // Rate limiting - default 10 requests per minute
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute in milliseconds
          limit: 10, // 10 requests per minute default
        },
      ],
    }),
    LoggerModule,
    BotsModule,
    ChatsModule,
    MessageProcessingModule,
    AuthModule,
    HealthModule,
    JobsModule,
    TgUsersModule,
    SettingsModule,
  ],
})
export class AppModule {}
