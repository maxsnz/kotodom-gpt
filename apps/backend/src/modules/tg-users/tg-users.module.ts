import { Module, forwardRef } from "@nestjs/common";

import { TgUsersAdminController } from "./tg-users-admin.controller";
import { TgUsersService } from "./tg-users.service";
import { TgUserRepository } from "../../domain/tg-users/TgUserRepository";
import { TgUserRepositoryPrisma } from "../../infra/db/repositories/TgUserRepositoryPrisma";
import { ChatsModule } from "../chats/chats.module";

@Module({
  imports: [forwardRef(() => ChatsModule)],
  controllers: [TgUsersAdminController],
  providers: [
    TgUsersService,

    // TgUser repository - Prisma implementation
    {
      provide: TgUserRepository,
      useClass: TgUserRepositoryPrisma,
    },
  ],
  exports: [TgUserRepository],
})
export class TgUsersModule {}
