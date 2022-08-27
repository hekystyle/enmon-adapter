import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Config } from './types.js';

/**
 * @throws {ValidationError[]} if the config is invalid
 */
export const parseConfig = async (config: unknown): Promise<Readonly<Config>> => {
  const instance = plainToInstance(Config, config);

  await validateOrReject(instance);

  return instance;
};
