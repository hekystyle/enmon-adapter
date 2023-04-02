import { DynamicModule, Module } from '@nestjs/common';
import { configProvider } from './config.provider.js';

@Module({
  controllers: [],
  exports: [configProvider],
  imports: [],
  providers: [configProvider],
})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      exports: [configProvider],
      providers: [configProvider],
    };
  }
}
