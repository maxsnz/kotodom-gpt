import { Module } from "@nestjs/common";

import { BotsModule } from "./modules/bots/bots.module";
import { ChatsModule } from "./modules/chats/chats.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [BotsModule, ChatsModule, AuthModule, HealthModule],
})
export class AppModule {}

