import { Module } from '@nestjs/common';
import { WATTrouterService } from './wattrouter.service.js';
import { wattrouterApiClientProvider } from './wattrouterApiClient.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';

@Module({
  imports: [EnmonModule],
  providers: [WATTrouterService, wattrouterApiClientProvider],
  exports: [],
})
export class WATTrouterModule {}
