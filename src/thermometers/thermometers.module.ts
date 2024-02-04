import { Module } from '@nestjs/common';
import { ThermometersTasksService } from './tasks.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { ThermometerWorkerFactory } from './worker-factory.js';

@Module({
  imports: [EnmonModule],
  providers: [ThermometersTasksService, ThermometerWorkerFactory],
  exports: [],
})
export class ThermometersModule {}
