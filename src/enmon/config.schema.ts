import { z } from 'zod';
import { EnmonEnv } from './ApiClient.js';

export const configEnmonSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  devEUI: z.string(),
  token: z.string(),
});
