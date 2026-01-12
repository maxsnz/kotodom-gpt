import { Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import { SettingsRepositoryPrisma } from "../../infra/db/repositories/SettingsRepositoryPrisma";

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,

    // Settings repository - Prisma implementation
    {
      provide: SettingsRepository,
      useClass: SettingsRepositoryPrisma,
    },
  ],
  exports: [SettingsRepository],
})
export class SettingsModule {}
