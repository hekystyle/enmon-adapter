import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { ThermometerService } from './thermometer.service.js';

@Module({
  controllers: [],
  exports: [],
  imports: [],
  providers: [TasksService, ThermometerService],
})
export class ThermometersModule {}
