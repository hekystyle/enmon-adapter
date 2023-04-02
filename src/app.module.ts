import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { loggerFactoryProvider } from './logger.provider.js';
import { ConfigModule } from './config/config.module.js';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  providers: [loggerFactoryProvider, enmonApiClientProvider],
})
export class AppModule {}
