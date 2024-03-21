import { z } from 'zod';
import { configEnmonSchema } from '../enmon/config.schema.js';

export const rpcConfig = z.object({
  url: z.string().url(),
  username: z.string(),
  password: z.string(),
});

export type RpcConfig = z.infer<typeof rpcConfig>;

export const bitcoinConfig = z.object({
  rpc: rpcConfig,
  integrations: z.object({
    enmon: configEnmonSchema,
  }),
});

export type BitcoinConfig = z.infer<typeof bitcoinConfig>;
