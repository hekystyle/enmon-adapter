import { DynamicModule } from '@nestjs/common';
import { configProvider } from './config.provider.js';
import { ConfigHost } from './host.js';

export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      providers: [configProvider],
      exports: [ConfigHost],
    };
  }
}
