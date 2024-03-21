import { Global, Module } from '@nestjs/common';
import { loggerFactoryProvider } from './logger.provider.js';
import { ContextAwareLogger } from './context-aware.logger.js';
import { winstonProvider } from './winston.provider.js';

@Global()
@Module({
  providers: [loggerFactoryProvider, ContextAwareLogger, winstonProvider],
  exports: [loggerFactoryProvider, ContextAwareLogger],
})
export class LogModule {}
