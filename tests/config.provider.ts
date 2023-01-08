import { Provider } from '@nestjs/common';
import { Config } from '../src/config/types.js';

export const testConfigProvider: Provider = {
  provide: Config,
  useValue: new Config(),
};
