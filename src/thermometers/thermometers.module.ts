import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { ThermometerService } from './thermometer.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';

@Module({
  imports: [EnmonModule],
  providers: [TasksService, ThermometerService],
  exports: [],
})
export class ThermometersModule {}
