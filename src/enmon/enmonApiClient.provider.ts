import type { FactoryProvider } from '@nestjs/common';
import { EnmonApiClient, EnmonEnv } from './ApiClient.js';

export const enmonApiClientProvider: FactoryProvider<EnmonApiClient> = {
  provide: EnmonApiClient,
  useFactory: () => new EnmonApiClient(EnmonEnv.Dev),
};
