import { Module, forwardRef } from "@nestjs/common";

import { MessageProcessingRepository } from "../../domain/message-processing/MessageProcessingRepository";
import { MessageProcessingRepositoryPrisma } from "../../infra/db/repositories/MessageProcessingRepositoryPrisma";
import { MessageProcessingAdminController } from "./message-processing-admin.controller";
import { MessageProcessingService } from "./message-processing.service";
import { ProcessingRecoveryService } from "./processing-recovery.service";
import { ChatsModule } from "../chats/chats.module";
import { JobsModule } from "../jobs/jobs.module";

@Module({
  imports: [forwardRef(() => ChatsModule), JobsModule],
  controllers: [MessageProcessingAdminController],
  providers: [
    {
      provide: MessageProcessingRepository,
      useClass: MessageProcessingRepositoryPrisma,
    },
    MessageProcessingService,
    ProcessingRecoveryService,
  ],
  exports: [
    MessageProcessingRepository,
    MessageProcessingService,
    ProcessingRecoveryService,
  ],
})
export class MessageProcessingModule {}
