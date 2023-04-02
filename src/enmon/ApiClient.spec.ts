import { EnmonApiClient, EnmonEnv } from './ApiClient.js';

it.each([...Object.values(EnmonEnv).map(env => [env] as const)])('should create instance for env %p', env => {
  expect(new EnmonApiClient(env)).toBeInstanceOf(EnmonApiClient);
});
