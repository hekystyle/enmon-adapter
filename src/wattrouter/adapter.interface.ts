import { ConfigWattRouter } from './config.schema.js';
import { AllTimeStats, Measurement } from './schemas.js';

export type WATTrouterValues = AllTimeStats & Measurement;

export interface WATTrouter {
  fetchValues(baseUrl: ConfigWattRouter['baseURL']): Promise<WATTrouterValues>;
}

export const isWATTrouter = (adapter: unknown): adapter is WATTrouter =>
  typeof adapter === 'object' &&
  adapter !== null &&
  'fetchValues' in adapter &&
  typeof adapter.fetchValues === 'function';
