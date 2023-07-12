import plainConfig from 'config';
import { parseConfig } from './parse.js';

export * from './schemas.js';
export * from './config.provider.js';
export { parseConfig };

export default async () => await parseConfig(plainConfig);
