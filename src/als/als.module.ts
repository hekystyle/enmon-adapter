import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Global()
@Module({
  providers: [AsyncLocalStorage],
  exports: [AsyncLocalStorage],
})
export class AsyncLocalStorageModule {}
