import type { FactoryProvider } from '@nestjs/common';
import { Config } from './types.js';

export const configProvider: FactoryProvider<Config> = {
  provide: Config,
  useFactory: async () => {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax -- dynamic import is supported
    const module = await import('./index.js');
    return module.default;
  },
};
