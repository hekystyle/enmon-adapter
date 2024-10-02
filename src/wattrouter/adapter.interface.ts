import { ConfigWattRouter } from './config.schema.js';
import { AllTimeStats } from './all-time-stats.schema.js';
import { Measurement } from './measurement.schema.js';

export type WATTrouterValues = AllTimeStats & Measurement;

// NOTE: I prefix prevents naming collision with decorator
/** WATTrouter adapter interface. */
export interface IAdapter {
  getValues(baseUrl: ConfigWattRouter['baseURL']): Promise<WATTrouterValues>;
}

export const isIAdapter = (adapter: unknown): adapter is IAdapter =>
  typeof adapter === 'object' &&
  adapter !== null &&
  ('getValues' satisfies keyof IAdapter) in adapter &&
  typeof adapter.getValues === 'function';
