import { z } from 'zod';
import { WATTrouterModel } from './model.js';
import { configEnmonSchema } from '../enmon/config.schema.js';

export const configWattRouterSchemas = {
  /**
   * @deprecated Don't use for new config, use latest instead.
   */
  legacyV1: z.object({
    model: z.nativeEnum(WATTrouterModel).optional().default(WATTrouterModel.Mx),
    baseURL: z.string().url(),
    enmon: configEnmonSchema,
  }),
  latest: z.object({
    model: z.nativeEnum(WATTrouterModel).optional().default(WATTrouterModel.Mx),
    baseURL: z.string().url(),
    targets: z.array(configEnmonSchema),
  }),
};

export type ConfigWattRouter = z.infer<typeof configWattRouterSchemas.latest>;
