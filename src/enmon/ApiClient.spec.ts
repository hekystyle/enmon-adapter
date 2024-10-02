import { expect, it } from 'vitest';
import { EnmonEnv } from './env.enum.js';
import { EnmonApiClient } from './ApiClient.js';

it.each([...Object.values(EnmonEnv).map(env => [env] as const)])('should create instance for env %j', env => {
  expect(new EnmonApiClient(env)).toBeInstanceOf(EnmonApiClient);
});
