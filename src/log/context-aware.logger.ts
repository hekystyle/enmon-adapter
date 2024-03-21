import winston from 'winston';
import { Injectable, type LoggerService, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsValues, Host } from '../als/values-host.js';

interface Meta {
  [key: string]: unknown;
  message?: string;
  error?: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class ContextAwareLogger implements LoggerService {
  private context: string | undefined;

  constructor(
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    private readonly logger: winston.Logger,
  ) {}

  log(message: string | Meta, meta?: Meta) {
    this.logger.info(
      this.prepareMessage({
        ...(typeof message === 'string' ? { message } : message),
        ...meta,
      }),
    );
  }

  error(errorOrMeta: Error | Meta) {
    this.logger.error(this.prepareMessage(errorOrMeta instanceof Error ? { error: errorOrMeta } : errorOrMeta));
  }

  warn(message: string | Meta, meta?: Meta) {
    this.logger.warn(
      this.prepareMessage({
        ...(typeof message === 'string' ? { message } : message),
        ...meta,
      }),
    );
  }

  debug(message: string | Meta, meta?: Meta) {
    this.logger.debug(
      this.prepareMessage({
        ...(typeof message === 'string' ? { message } : message),
        ...meta,
      }),
    );
  }

  verbose(message: string | Meta, meta?: Meta) {
    this.logger.verbose(
      this.prepareMessage({
        ...(typeof message === 'string' ? { message } : message),
        ...meta,
      }),
    );
  }

  setContext(context: string): this {
    this.context = context;
    return this;
  }

  private prepareMessage(meta: Meta) {
    const { message, error, ...restMeta } = meta;

    const serializedError = this.serializeError(error);

    const logObj: Record<string | number, unknown> = {
      message,
      meta: restMeta,
      ...(error ? { error: serializedError } : {}),
      als: this.getAlsStore(),
      context: this.context,
    };

    return logObj;
  }

  private serializeError(error: unknown): unknown {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause instanceof Error ? this.serializeError(error.cause) : error.cause,
      };
    }
    if (error !== null && typeof error === 'object' && 'toJSON' in error && typeof error.toJSON === 'function') {
      return error.toJSON();
    }
    return error;
  }

  private getAlsStore(): unknown {
    const store = this.als.getStore();
    return store instanceof Host ? store.ref : store;
  }
}
