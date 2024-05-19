import { z } from 'zod';
import { EnmonEnv } from './env.js';

export const enmonIntegrationBaseConfigSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  token: z.string(),
});

export type EnmonIntegrationBaseConfig = z.infer<typeof enmonIntegrationBaseConfigSchema>;

export const configEnmonSchema = enmonIntegrationBaseConfigSchema.partial().extend({
  devEUI: z.string(),
});

export type ConfigEnmon = z.infer<typeof configEnmonSchema>;
