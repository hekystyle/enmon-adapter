import { Module } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { TasksService } from './tasks.service.js';
import { ThermometerService } from './thermometer.service.js';

@Module({
  controllers: [],
  exports: [],
  imports: [AppModule],
  providers: [TasksService, ThermometerService],
})
export class ThermometersModule {}
