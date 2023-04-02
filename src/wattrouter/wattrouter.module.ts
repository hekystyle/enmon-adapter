import { Module } from '@nestjs/common';
import { WATTrouterService } from './wattrouter.service.js';
import { wattrouterApiClientProvider } from './wattrouterApiClient.provider.js';
import { AppModule } from '../app.module.js';

@Module({
  exports: [],
  imports: [AppModule],
  providers: [WATTrouterService, wattrouterApiClientProvider],
})
export class WATTrouterModule {}
