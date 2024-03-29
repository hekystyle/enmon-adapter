import { z } from 'zod';
import { EnmonEnv } from '../enmon/ApiClient.js';

export const THERMOMETER_MODELS = ['UNI7xxx', 'UNI1xxx'] as const;
export type ThermometerModel = (typeof THERMOMETER_MODELS)[number];

const configEnmonSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  devEUI: z.string(),
  token: z.string(),
});

const configThermometerSchema = z.object({
  model: z.enum(THERMOMETER_MODELS),
  dataSourceUrl: z.string().url(),
  enmon: configEnmonSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;

const configWattrouterSchema = z.object({
  baseURL: z.string().url(),
  enmon: configEnmonSchema,
});

export const configSchema = z.object({
  thermometers: z.array(configThermometerSchema),
  wattrouter: configWattrouterSchema,
});

export type Config = z.infer<typeof configSchema>;
