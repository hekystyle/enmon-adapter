import { Module } from '@nestjs/common';
import { WATTrouterService } from './wattrouter.service.js';
import { wattrouterApiClientProvider } from './wattrouterApiClient.provider.js';

@Module({
  exports: [],
  imports: [],
  providers: [WATTrouterService, wattrouterApiClientProvider],
})
export class WATTrouterModule {}
