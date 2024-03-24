import { ConfigThermometer } from '../config/schemas.js';

export interface Thermometer {
  model: string;

  handleTemperature(config: ConfigThermometer): Promise<void>;
}
