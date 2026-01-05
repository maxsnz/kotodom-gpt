import { Module, Global } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UsersAdminController } from "./users-admin.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { SESSION_STORE } from "./session/session.constants";
import { createSessionStore } from "./session/session-store.factory";
import { SessionAuthGuard } from "./guards/session-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

import { UserRepository } from "../../domain/users/UserRepository";
import { UserRepositoryPrisma } from "../../infra/db/repositories/UserRepositoryPrisma";
import { env } from "../../config/env";

@Global()
@Module({
  controllers: [AuthController, UsersAdminController],
  providers: [
    AuthService,
    UsersService,
    SessionAuthGuard,
    RolesGuard,

    // Session store - auto-switch between Memory and Redis based on REDIS_URL
    {
      provide: SESSION_STORE,
      useFactory: () => createSessionStore(env.REDIS_URL),
    },

    // User repository - Prisma implementation
    {
      provide: UserRepository,
      useClass: UserRepositoryPrisma,
    },
  ],
  exports: [
    AuthService,
    UsersService,
    SessionAuthGuard,
    RolesGuard,
    SESSION_STORE,
  ],
})
export class AuthModule {}
