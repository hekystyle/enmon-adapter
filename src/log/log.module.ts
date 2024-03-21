import { Global, Module } from '@nestjs/common';
import { ContextAwareLogger } from './context-aware.logger.js';
import { winstonProvider } from './winston.provider.js';

@Global()
@Module({
  providers: [ContextAwareLogger, winstonProvider],
  exports: [ContextAwareLogger],
})
export class LogModule {}
