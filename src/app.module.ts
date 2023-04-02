import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { configProvider } from './config.provider.js';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { loggerFactoryProvider } from './logger.provider.js';
import { TasksService } from './tasks.service.js';
import { ThermometerService } from './thermometer.service.js';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [configProvider, loggerFactoryProvider, enmonApiClientProvider, TasksService, ThermometerService],
  exports: [configProvider],
})
export class AppModule {}
