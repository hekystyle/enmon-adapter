import { AsyncLocalStorage } from 'node:async_hooks';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { Config } from '../config/schemas.js';
import { AppLogger } from './logger.js';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => ({
        transports: new winston.transports.Console(),
        format: config.getOrThrow('DEV', { infer: true })
          ? winston.format.prettyPrint({ colorize: true })
          : winston.format.json(),
      }),
    }),
  ],
  providers: [AppLogger, AsyncLocalStorage],
  exports: [AppLogger],
})
export class LoggingModule {}
