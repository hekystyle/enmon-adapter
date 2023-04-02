import { Global, Module } from '@nestjs/common';
import { loggerFactoryProvider } from './logger.provider.js';

@Global()
@Module({
  providers: [loggerFactoryProvider],
  exports: [loggerFactoryProvider],
})
export class LogModule {}
