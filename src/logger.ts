import type { LoggerService, LogLevel } from '@nestjs/common';
import type { Debugger } from 'debug';

export class Logger implements LoggerService {
  private levels: readonly LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  constructor(public readonly instance: Debugger) {}

  log(message: unknown, ...optionalParams: unknown[]) {
    if (this.levels.includes('log')) this.instance(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    if (this.levels.includes('error')) this.instance(message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    if (this.levels.includes('warn')) this.instance(message, ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    if (this.levels.includes('debug')) this.instance(message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    if (this.levels.includes('verbose')) this.instance(message, ...optionalParams);
  }

  setLogLevels(levels: LogLevel[]) {
    this.levels = [...levels];
    return this;
  }

  extend(namespace: string) {
    return new Logger(this.instance.extend(namespace));
  }
}
