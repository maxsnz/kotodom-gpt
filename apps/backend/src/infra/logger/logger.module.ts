import { Global, Module } from "@nestjs/common";

import { LOGGER_FACTORY } from "./logger.types";
import { createPinoLoggerFactory } from "./pinoLogger";
import { NestLoggerService } from "./nest-logger.service";

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_FACTORY,
      useFactory: () => createPinoLoggerFactory(),
    },
    NestLoggerService,
  ],
  exports: [LOGGER_FACTORY, NestLoggerService],
})
export class LoggerModule {}

