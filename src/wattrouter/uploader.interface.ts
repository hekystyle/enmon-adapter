import { WATTrouterValues } from './adapter.interfaces.js';

export interface WATTrouterUploader<TConfig = unknown> {
  readonly integrationId: string;

  upload(measurement: WATTrouterValues, config: TConfig): Promise<void>;
}
