import { expect, it } from 'vitest';
import { EnmonApiClient } from './ApiClient.js';
import { EnmonEnv } from './env.js';

it.each([...Object.values(EnmonEnv).map(env => [env] as const)])('should create instance for env %j', env => {
  expect(new EnmonApiClient(env)).toBeInstanceOf(EnmonApiClient);
});
