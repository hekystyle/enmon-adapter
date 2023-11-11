import { Global, Module } from '@nestjs/common';
import { AppLogger } from '../logger.js';

@Global()
@Module({
  imports: [],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LogModule {}
