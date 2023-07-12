import type { FactoryProvider } from '@nestjs/common';
import { WATTrouterMxApiClient } from './MxApiClient.js';
import type { Config } from '../config/schemas.js';
import { configProvider } from '../config/config.provider.js';

export const wattrouterApiClientProvider: FactoryProvider<WATTrouterMxApiClient> = {
  provide: WATTrouterMxApiClient,
  useFactory: (config: Config) => new WATTrouterMxApiClient(config.wattrouter.baseURL),
  inject: [configProvider.provide],
};
