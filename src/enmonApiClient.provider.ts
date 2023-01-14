import { FactoryProvider } from '@nestjs/common';
import { EnmonApiClient, EnmonEnv } from './services/enmon.js';

export const enmonApiClientProvider: FactoryProvider<EnmonApiClient> = {
  provide: EnmonApiClient,
  useFactory: () => new EnmonApiClient(EnmonEnv.Dev),
};
