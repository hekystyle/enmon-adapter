import { FactoryProvider } from '@nestjs/common';
import debug from 'debug';
import { Logger } from '../logger.js';

export const loggerFactoryProvider: FactoryProvider<Logger> = {
  provide: Logger,
  useFactory: () => new Logger(debug('app')),
};
