import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { Config } from './types.js';

export class ParseError extends Error {
  constructor(message: string, public readonly errors: ValidationError[]) {
    super(message);
    this.name = ParseError.name;
  }
}

/**
 * @throws {ParseError} if the config is invalid
 */
export const parseConfig = async (config: unknown): Promise<Config> => {
  const instance = plainToInstance(Config, config);

  try {
    await validateOrReject(instance);
  } catch (e) {
    if (Array.isArray(e) && e.every((value): value is ValidationError => value instanceof ValidationError)) {
      throw new ParseError(e.map(error => error.toString()).join('\n'), e);
    }
    throw e;
  }

  return instance;
};
