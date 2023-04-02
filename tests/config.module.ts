import { Global, Module } from '@nestjs/common';
import { testConfigProvider } from './config.provider.js';

@Global()
@Module({
  imports: [],
  providers: [testConfigProvider],
  exports: [testConfigProvider],
})
export class TestConfigModule {}
