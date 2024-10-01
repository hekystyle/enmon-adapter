import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { EnmonModule } from './enmon/enmon.module.js';
import { ThermometersModule } from './thermometers/thermometers.module.js';
import { WATTrouterModule } from './wattrouter/wattrouter.module.js';
import { LogModule } from './log/log.module.js';
import { AlsModule } from './als/als.module.js';
import configuration from './config/configuration.js';

@Module({
  imports: [
    AlsModule.forRoot(),
    BullModule.forRoot({
      prefix: 'enmon-adapter',
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: {
          // 30 days
          age: 1000 * 60 * 60 * 24 * 30,
        },
        removeOnFail: {
          // 30 days
          age: 1000 * 60 * 60 * 24 * 30,
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EnmonModule,
    LogModule,
    ThermometersModule,
    WATTrouterModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
