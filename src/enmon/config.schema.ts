import { z } from 'zod';
import { EnmonEnv } from './env.enum.js';

export const configEnmonSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  devEUI: z.string(),
  token: z.string(),
});

export type ConfigEnmon = z.output<typeof configEnmonSchema>;
