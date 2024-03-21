import { Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsValues, Host } from './values-host.js';

@Module({})
export class AlsModule {
  static forRoot() {
    return {
      global: true,
      module: AlsModule,
      providers: [
        {
          provide: AsyncLocalStorage,
          useValue: new AsyncLocalStorage<Host<AlsValues>>(),
        },
      ],
      exports: [AsyncLocalStorage],
    };
  }
}
