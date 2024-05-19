import { ConfigWattrouter } from '../config/schemas.js';
import { Values } from './adapter.interfaces.js';

export interface WATTrouterUploader {
  readonly integrationId: string;

  upload(measurement: Values, config: ConfigWattrouter): Promise<void>;
}
