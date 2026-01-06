import { Module } from "@nestjs/common";

import { PgBossClient } from "../../infra/jobs/pgBoss";
import { WorkerRegistrationService } from "../../infra/jobs/pgBoss/WorkerRegistrationService";

@Module({
  providers: [PgBossClient, WorkerRegistrationService],
  exports: [PgBossClient, WorkerRegistrationService],
})
export class JobsModule {}



