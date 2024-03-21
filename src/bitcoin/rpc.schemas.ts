import { z } from 'zod';

function rpcResult<T>(result: z.Schema<T>) {
  return z.union([
    z.object({
      result,
      error: z.null(),
      id: z.string().optional(),
    }),
    z.object({
      result: z.null(),
      error: z.object({
        code: z.number(),
        message: z.string(),
      }),
      id: z.string().optional(),
    }),
  ]);
}

const getBlockchainInfo = z.object({
  blocks: z.number().min(0),
  headers: z.number().min(0),
  verificationprogress: z.number().min(0).max(1),
});

export type GetBlockchainInfo = z.infer<typeof getBlockchainInfo>;

export const getBlockchainInfoResult = rpcResult(getBlockchainInfo);

export type GetBlockchainInfoResult = z.infer<typeof getBlockchainInfoResult>;
