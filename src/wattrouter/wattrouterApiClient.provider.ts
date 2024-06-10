import type { FactoryProvider } from '@nestjs/common';
import axios from 'axios';
import { WATTrouterMxApiClient } from './MxApiClient.js';

export const wattrouterApiClientProvider: FactoryProvider<WATTrouterMxApiClient> = {
  provide: WATTrouterMxApiClient,
  useFactory: () => new WATTrouterMxApiClient(axios.create()),
  inject: [],
};
