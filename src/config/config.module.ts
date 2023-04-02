import { Global, Module } from '@nestjs/common';
import { configProvider } from './config.provider.js';

@Global()
@Module({
  imports: [],
  providers: [configProvider],
  exports: [configProvider],
})
export class ConfigModule {}
