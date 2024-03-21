import { Provider } from '@nestjs/common';
import winston from 'winston';

export const winstonProvider: Provider<winston.Logger> = {
  provide: winston.Logger,
  useFactory: () =>
    winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        process.env['NODE_ENV'] === 'production' ? winston.format.json() : winston.format.prettyPrint(),
      ),
      transports: [new winston.transports.Console({})],
    }),
};
