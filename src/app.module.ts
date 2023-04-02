import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { enmonApiClientProvider } from './enmon/enmonApiClient.provider.js';
import { loggerFactoryProvider } from './logger.provider.js';
import { ConfigModule } from './config/config.module.js';
import { EnmonModule } from './enmon/enmon.module.js';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), EnmonModule.forRoot()],
  providers: [loggerFactoryProvider, enmonApiClientProvider],
})
export class AppModule {}
