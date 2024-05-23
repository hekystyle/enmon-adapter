import { ConfigWATTrouter } from '../config/schemas.js';
import { WATTRouterModel } from './model.enum.js';
import type { AllTimeStats } from './schemas.js';

export interface WATTrouterValues extends Pick<AllTimeStats, 'SAP4' | 'SAS4' | 'SAH4' | 'SAL4'> {
  voltageL1: number;
}

export interface WATTrouterAdapter {
  readonly model: WATTRouterModel;

  getValues(config: ConfigWATTrouter): Promise<WATTrouterValues>;
}
