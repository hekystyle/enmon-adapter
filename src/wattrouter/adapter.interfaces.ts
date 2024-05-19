import { ConfigWattrouter } from '../config/schemas.js';
import type { AllTimeStats } from './schemas.js';

export interface Values extends Pick<AllTimeStats, 'SAP4' | 'SAS4' | 'SAH4' | 'SAL4'> {
  voltageL1: number;
}

export interface WATTrouterAdapter {
  readonly model: string;

  getValues(config: ConfigWattrouter): Promise<Values>;
}
