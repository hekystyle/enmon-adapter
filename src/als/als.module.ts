import { AsyncLocalStorage } from 'node:async_hooks';
import { DynamicModule } from '@nestjs/common';

export class AlsModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: AlsModule,
      providers: [AsyncLocalStorage],
      exports: [AsyncLocalStorage],
    };
  }
}
