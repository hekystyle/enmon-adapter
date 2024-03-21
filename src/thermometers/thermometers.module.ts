import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';

@Module({
  imports: [EnmonModule],
  providers: [TasksService, ThermometerUNI1xxx, ThermometerUNI7xxx],
  exports: [],
})
export class ThermometersModule {}
