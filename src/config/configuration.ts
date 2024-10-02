import { parseConfig } from './parse.js';

export default async () => {
  const config = await import('config');

  return await parseConfig({
    DEV: process.env['NODE_ENV'] !== 'production',
    ...config.default,
  });
};
