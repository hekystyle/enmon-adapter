import { ConfigThermometer } from '../config/schemas.js';

export interface Thermometer {
  readonly model: string;

  getTemperatures(config: ConfigThermometer): Promise<number[]>;
}

export interface TemperaturesUploader {
  readonly integrationId: string;

  upload(temperatures: number[], config: ConfigThermometer): Promise<void>;
}
