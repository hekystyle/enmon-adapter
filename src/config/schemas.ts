import { z } from 'zod';
import { configWattRouterSchema } from '../wattrouter/config.schema.js';
import { configThermometerSchema } from '../thermometers/config.schema.js';

export const configSchema = z
  .object({
    DEV: z.boolean(),
    db: z
      .object({
        uri: z.string().url(),
      })
      .optional()
      .default({
        uri: 'mongodb://db/enmon-adapter',
      }),
    enmon: z
      .object({
        contactEmail: z.string().email().optional(),
      })
      .optional()
      .default({}),
    thermometers: z.array(configThermometerSchema).nullish(),
    wattrouter: configWattRouterSchema.nullish(),
    wattrouters: z.array(configWattRouterSchema).nullish(),
  })
  .transform(({ thermometers, wattrouters, wattrouter, ...rest }) => {
    return {
      thermometers: thermometers ?? [],
      wattrouters: wattrouters ?? (wattrouter ? [wattrouter] : []),
      ...rest,
    };
  });

export type InputConfig = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;
