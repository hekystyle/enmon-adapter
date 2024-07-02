import { z } from 'zod';
import { configWattRouterSchema } from '../wattrouter/config.schema.js';
import { configEnmonSchema } from '../enmon/config.schema.js';

export enum ThermometerModel {
  UNI7xxx = 'UNI7xxx',
  UNI1xxx = 'UNI1xxx',
}

const configThermometerSchema = z.object({
  model: z.nativeEnum(ThermometerModel),
  dataSourceUrl: z.string().url(),
  enmon: configEnmonSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;

export const configSchema = z
  .object({
    thermometers: z.array(configThermometerSchema).nullish(),
    wattrouter: configWattRouterSchema.nullish(),
    wattrouters: z.array(configWattRouterSchema).nullish(),
  })
  .transform(({ thermometers, wattrouters, wattrouter }) => {
    return {
      thermometers: thermometers ?? [],
      wattrouters: wattrouters ?? (wattrouter ? [wattrouter] : []),
    };
  });

export type InputConfig = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;
