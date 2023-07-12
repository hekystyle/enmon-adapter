import type { FactoryProvider } from '@nestjs/common';
import { type Config } from './schemas.js';

export const configProvider: FactoryProvider<Config> = {
  provide: 'config',
  useFactory: async () => {
    // eslint-disable-next-line n/no-unsupported-features/es-syntax -- dynamic import is supported
    const module = await import('./index.js');
    return await module.default();
  },
};
