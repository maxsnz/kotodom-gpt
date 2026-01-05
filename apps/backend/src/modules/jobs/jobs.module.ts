import { Module } from "@nestjs/common";

import { PgBossClient } from "../../infra/jobs/pgBoss";

@Module({
  providers: [PgBossClient],
  exports: [PgBossClient],
})
export class JobsModule {}



