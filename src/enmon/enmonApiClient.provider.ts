import type { FactoryProvider } from '@nestjs/common';
import { EnmonApiClient } from './ApiClient.js';
import { Config, configProvider } from '../config/index.js';

export const enmonApiClientProvider: FactoryProvider<EnmonApiClient> = {
  provide: EnmonApiClient,
  inject: [configProvider.provide],
  useFactory: (config: Config) => new EnmonApiClient(config.integrations?.enmon),
};
