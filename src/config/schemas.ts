import { z } from 'zod';
import { enmonIntegrationConfigSchema } from '../enmon/config.schema.js';
import { WATTRouterModel } from '../wattrouter/model.enum.js';

export const THERMOMETER_MODELS = ['UNI7xxx', 'UNI1xxx'] as const;
export type ThermometerModel = (typeof THERMOMETER_MODELS)[number];

const configThermometerSchema = z.object({
  model: z.enum(THERMOMETER_MODELS),
  dataSourceUrl: z.string().url(),
  enmon: enmonIntegrationConfigSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;

const configWattRouterSchema = z.object({
  baseURL: z.string().url(),
  model: z.nativeEnum(WATTRouterModel).optional().default(WATTRouterModel.Mx),
  enmon: enmonIntegrationConfigSchema,
});

export type ConfigWATTrouter = z.infer<typeof configWattRouterSchema>;

export const configSchema = z
  .object({
    thermometers: z.array(configThermometerSchema),
    /**
     * @deprecated Use `wattrouters` instead.
     */
    wattrouter: configWattRouterSchema.optional(),
    wattrouters: configWattRouterSchema.array().optional().default([]),
  })
  .transform(config => {
    return {
      thermometers: config.thermometers,
      wattrouters: config.wattrouter ? [config.wattrouter, ...config.wattrouters] : config.wattrouters,
    };
  });

export type Config = z.infer<typeof configSchema>;
