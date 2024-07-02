import type { FactoryProvider } from '@nestjs/common';
import { ConfigHost } from './host.js';

export const configProvider: FactoryProvider<ConfigHost> = {
  provide: ConfigHost,
  useFactory: async () => {
    // eslint-disable-next-line n/no-unsupported-features/es-syntax -- dynamic import is supported
    const module = await import('./index.js');
    const config = await module.default();
    return new ConfigHost(config);
  },
};
