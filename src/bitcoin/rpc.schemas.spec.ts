import { expect, it } from 'vitest';
import { getBlockchainInfoResult } from './rpc.schemas.js';

it('should parse example success message', () => {
  const result = getBlockchainInfoResult.parse({
    result: {
      chain: 'main',
      blocks: 835003,
      headers: 835067,
      bestblockhash: '00000000000000000002858b51522020ff22ae51a4f8f57f586b1a4f7234ce2c',
      difficulty: 83947913181361.55,
      time: 1710635650,
      mediantime: 1710633976,
      verificationprogress: 0.9997647552823518,
      initialblockdownload: false,
      chainwork: '00000000000000000000000000000000000000006f63ba99728a094fc1b70db0',
      size_on_disk: 249946607674,
      pruned: true,
      pruneheight: 677651,
      automatic_pruning: true,
      prune_target_size: 249999392768,
      warnings: '',
    },
    error: null,
    id: 'id',
  });

  expect(result).toStrictEqual({
    result: {
      height: 0,
    },
    error: null,
    id: 'id',
  });
});

it('should parse error message', () => {
  const result = getBlockchainInfoResult.parse({
    result: null,
    error: {
      code: -1,
      message: 'error',
    },
    id: 'id',
  });

  expect(result).toStrictEqual({
    result: null,
    error: {
      code: -1,
      message: 'error',
    },
    id: 'id',
  });
});
