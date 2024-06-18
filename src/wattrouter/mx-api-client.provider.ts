import type { FactoryProvider } from '@nestjs/common';
import axios from 'axios';
import { WATTrouterMxApiClient } from './mx-api-client.js';

export const mxApiClientProvider: FactoryProvider<WATTrouterMxApiClient> = {
  provide: WATTrouterMxApiClient,
  inject: [],
  useFactory: () => new WATTrouterMxApiClient(axios.create()),
};
