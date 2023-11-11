import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule, utilities } from 'nest-winston';
import winston from 'winston';
import { ConfigModule } from './config/config.module.js';
import { EnmonModule } from './enmon/enmon.module.js';
import { ThermometersModule } from './thermometers/thermometers.module.js';
import { WATTrouterModule } from './wattrouter/wattrouter.module.js';
import { LogModule } from './log/log.module.js';
import { AsyncLocalStorageModule } from './als/als.module.js';

@Module({
  imports: [
    AsyncLocalStorageModule,
    ConfigModule,
    EnmonModule,
    LogModule,
    ScheduleModule.forRoot(),
    ThermometersModule,
    WATTrouterModule,
    WinstonModule.forRootAsync({
      useFactory: () => ({
        level: 'debug',
        format:
          process.env.NODE_ENV === 'production'
            ? winston.format.json()
            : winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                utilities.format.nestLike('App', {
                  colors: true,
                  prettyPrint: true,
                }),
              ),
        transports: [new winston.transports.Console()],
      }),
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
