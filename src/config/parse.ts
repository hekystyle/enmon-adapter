import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { Config } from './types.js';

/**
 * @throws {ValidationError[]} if the config is invalid
 */
export const parseConfig = async (config: unknown): Promise<Config> => {
  const instance = plainToInstance(Config, config);

  try {
    await validateOrReject(instance);
  } catch (e) {
    if (Array.isArray(e) && e.every((value): value is ValidationError => value instanceof ValidationError)) {
      throw new Error(e.map(error => error.toString()).join('\n'));
    }
    throw e;
  }

  return instance;
};
