import { z } from 'zod';
import { WATTrouterModel } from './model.js';
import { configEnmonSchema } from '../enmon/config.schema.js';

export const configWattRouterSchema = z
  .object({
    model: z.nativeEnum(WATTrouterModel).optional().default(WATTrouterModel.Mx),
    baseURL: z.string().url(),
    /**
     * @deprecated Use `targets` instead.
     */
    enmon: configEnmonSchema.optional(),
    targets: z.array(configEnmonSchema).optional(),
  })
  .transform(({ enmon, targets, ...data }) => {
    return {
      ...data,
      targets: targets ?? (enmon ? [enmon] : []),
    };
  });

export type ConfigWattRouter = z.infer<typeof configWattRouterSchema>;
