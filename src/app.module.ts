import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module.js';
import { EnmonModule } from './enmon/enmon.module.js';
import { ThermometersModule } from './thermometers/thermometers.module.js';
import { WATTrouterModule } from './wattrouter/wattrouter.module.js';
import { LogModule } from './log/log.module.js';

@Module({
  imports: [ConfigModule, EnmonModule, LogModule, ScheduleModule.forRoot(), ThermometersModule, WATTrouterModule],
  providers: [],
  exports: [],
})
export class AppModule {}
