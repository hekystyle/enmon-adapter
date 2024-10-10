import { Inject, Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import winston from 'winston';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class AppLogger extends WinstonLogger {
  protected ctx?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    logger: winston.Logger,
    @Inject(AsyncLocalStorage)
    private readonly als: AsyncLocalStorage<unknown[]>,
  ) {
    super(logger);
  }

  async beginScope<R>(scope: unknown, callback: () => R): Promise<R> {
    const scopes = this.als.getStore() ?? [];
    return await this.als.run([...scopes, scope], callback);
  }

  override setContext(context: string): void {
    super.setContext(context);
    this.ctx = context;
  }

  override log(message: unknown, context?: string) {
    const scopes = this.als.getStore();

    if(!!message && 'object' === typeof message) {
      return super.log( { ...message, scopes }, context);
    }

    return super.log({ message, scopes }, context);
  }

  override fatal(message: unknown, trace?: string, context?: string): unknown {
    const scopes = this.als.getStore();

    if (message instanceof Error) {
      const { message: msg, name, stack, ...meta } = message;

      return super.fatal({ message: msg, name, stack, error: message, scopes, ...meta }, trace, context)
    }

    if (!!message && 'object' === typeof message) {
      return this.fatal({ ...message, scopes }, trace, context);
    }

    return this.fatal({ message, scopes }, trace, context);
  }

  override error(message: unknown, trace?: string, context?: string): unknown {
    const scopes = this.als.getStore();

    if(message instanceof Error) {
      const { message: msg, name, stack, ...meta } = message;

      return super.error({ message: msg, name, stack, error: message, scopes, ...meta }, trace, context);
    }

    if(!!message && 'object' === typeof message) {
      return super.error({ ...message, scopes }, trace, context);
    }

    return super.error({ message, scopes }, trace, context);
  }

  override warn(message: unknown, context?: string): unknown {
    const scopes = this.als.getStore();

    if(!!message && 'object' === typeof message) {
      return super.warn({ ...message, scopes }, context);
    }

    return super.warn({ message, scopes }, context);
  }

  override debug?(message: unknown, context?: string): unknown {
    const scopes = this.als.getStore();

    if(!!message && 'object' === typeof message) {
      return super.debug?.({ ...message, scopes }, context);
    }

    return super.debug?.({ message, scopes }, context);
  }

  override verbose?(message: unknown, context?: string): unknown {
    const scopes = this.als.getStore();

    if(!!message && 'object' === typeof message) {
      return super.verbose?.({ ...message, scopes }, context);
    }

    return super.verbose?.({ message, scopes }, context);
  }
}
