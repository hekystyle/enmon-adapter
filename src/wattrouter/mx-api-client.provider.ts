import type { FactoryProvider } from '@nestjs/common';
import { WATTrouterMxApiClient } from './mx-api-client.js';
import type { Config } from '../config/schemas.js';
import { configProvider } from '../config/config.provider.js';

export const wattRouterApiClientProvider: FactoryProvider<WATTrouterMxApiClient> = {
  provide: WATTrouterMxApiClient,
  useFactory: (config: Config) => new WATTrouterMxApiClient(config.wattrouter.baseURL),
  inject: [configProvider.provide],
};
