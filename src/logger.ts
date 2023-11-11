import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    @Inject(AsyncLocalStorage)
    private readonly asyncLocalStorage: AsyncLocalStorage<unknown>,
  ) {}

  log(message: unknown, context?: string) {
    const store = this.asyncLocalStorage.getStore();
    this.logger.log(
      message,
      // @ts-expect-error - this is a hack to get the logger to print the context
      { name: context, store },
    );
  }

  error(message: unknown, trace?: string, context?: string) {
    const store = this.asyncLocalStorage.getStore();
    this.logger.error(
      message,
      trace,
      // @ts-expect-error - this is a hack to get the logger to print the context
      { name: context, store },
    );
  }

  warn(message: unknown, context?: string) {
    const store = this.asyncLocalStorage.getStore();
    this.logger.warn(
      message,
      // @ts-expect-error - this is a hack to get the logger to print the context
      { name: context, store },
    );
  }

  debug(message: unknown, context?: string) {
    const store = this.asyncLocalStorage.getStore();
    this.logger.debug?.(
      message,
      // @ts-expect-error - this is a hack to get the logger to print the context
      { name: context, store },
    );
  }

  verbose(message: unknown, context?: string) {
    const store = this.asyncLocalStorage.getStore();
    this.logger.verbose?.(
      message,
      // @ts-expect-error -- this is a hack to get the logger to print the context
      { name: context, store },
    );
  }
}
