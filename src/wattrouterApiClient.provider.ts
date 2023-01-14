import { FactoryProvider } from '@nestjs/common';
import { Config } from './config/types.js';
import { WATTrouterMxApiClient } from './services/wattrouter.js';

export const wattrouterApiClientProvider: FactoryProvider<WATTrouterMxApiClient> = {
  provide: WATTrouterMxApiClient,
  useFactory: (config: Config) => new WATTrouterMxApiClient(config.wattrouter.baseURL),
  inject: [Config],
};
