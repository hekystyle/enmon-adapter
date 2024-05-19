import { z } from 'zod';
import { configEnmonSchema, enmonIntegrationBaseConfigSchema } from '../enmon/config.schema.js';
import { WATTRouterModel } from '../wattrouter/model.enum.js';

export const THERMOMETER_MODELS = ['UNI7xxx', 'UNI1xxx'] as const;
export type ThermometerModel = (typeof THERMOMETER_MODELS)[number];

const integrationsSchema = z
  .object({
    enmon: enmonIntegrationBaseConfigSchema,
  })
  .partial();

const configThermometerSchema = z.object({
  model: z.enum(THERMOMETER_MODELS),
  dataSourceUrl: z.string().url(),
  enmon: configEnmonSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;

const configWattrouterSchema = z.object({
  baseURL: z.string().url(),
  model: z.nativeEnum(WATTRouterModel).optional().default(WATTRouterModel.Mx),
  enmon: configEnmonSchema,
});

export type ConfigWattrouter = z.infer<typeof configWattrouterSchema>;

export const configSchema = z.object({
  integrations: integrationsSchema.optional(),
  thermometers: z.array(configThermometerSchema),
  wattrouter: configWattrouterSchema,
});

export type Config = z.infer<typeof configSchema>;
