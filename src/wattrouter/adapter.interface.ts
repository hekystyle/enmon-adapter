import { Reading } from '../enmon/upload-reading.schema.js';
import { ConfigWattRouter } from './config.schema.js';

// NOTE: I prefix prevents naming collision with decorator
/** WATTrouter adapter interface. */
export interface IAdapter {
  getReadings(baseUrl: ConfigWattRouter['baseURL']): Promise<readonly Reading[]>;
}

export const isIAdapter = (adapter: unknown): adapter is IAdapter =>
  typeof adapter === 'object' &&
  adapter !== null &&
  ('getReadings' satisfies keyof IAdapter) in adapter &&
  typeof adapter.getReadings === 'function';
