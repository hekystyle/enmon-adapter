import { z } from 'zod';
import { EnmonEnv } from './env.js';

export const enmonIntegrationConfigSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  token: z.string(),
});

export type EnmonIntegrationConfig = z.infer<typeof enmonIntegrationConfigSchema>;
