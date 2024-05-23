import { z } from 'zod';
import { EnmonEnv } from './env.js';

export const enmonIntegrationConfigSchema = z
  .object({
    env: z.nativeEnum(EnmonEnv),
    customerId: z.string(),
    dataSourceId: z.string().optional(),
    /**
     * @deprecated Use `dataSourceId` instead.
     */
    devEUI: z.string(),
    token: z.string(),
  })
  .transform(({ devEUI, ...config }, ctx) => {
    const dataSourceId = config.dataSourceId ?? devEUI;
    if (!dataSourceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '`dataSourceId` must be provided',
        path: ['dataSourceId'],
      });
      return z.NEVER;
    }

    return { ...config, dataSourceId };
  });

export type EnmonIntegrationConfig = z.infer<typeof enmonIntegrationConfigSchema>;
