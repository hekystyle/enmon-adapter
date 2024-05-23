import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { WATTrouterService } from './wattrouter.service.js';
import { wattRouterApiClientProvider } from './mx-api-client.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { WATTrouterUploadersHost } from './uploaders.host.js';
import { WATTrouterAdaptersHost } from './adapters.host.js';
import { WATTrouterMxAdapter } from './mx.adapter.js';

@Module({
  imports: [EnmonModule, DiscoveryModule],
  providers: [
    WATTrouterService,
    wattRouterApiClientProvider,
    WATTrouterMxAdapter,
    WATTrouterAdaptersHost,
    WATTrouterUploadersHost,
  ],
  exports: [],
})
export class WATTrouterModule {}
