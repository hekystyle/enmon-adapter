import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module.js';
import { EnmonModule } from './enmon/enmon.module.js';
import { ThermometersModule } from './thermometers/thermometers.module.js';
import { WATTrouterModule } from './wattrouter/wattrouter.module.js';
import { LogModule } from './log/log.module.js';
import { BitcoinModule } from './bitcoin/bitcoin.module.js';
import { AlsModule } from './als/als.module.js';

@Module({
  imports: [
    AlsModule.forRoot(),
    ConfigModule,
    EnmonModule,
    LogModule,
    ScheduleModule.forRoot(),
    ThermometersModule,
    WATTrouterModule,
    BitcoinModule,
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
