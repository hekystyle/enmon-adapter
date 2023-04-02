import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { Config } from './types.js';

export class ParseError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super(errors.map(error => error.toString()).join('\n'));
    this.name = ParseError.name;
  }
}

const isValidationError = (value: unknown): value is ValidationError => value instanceof ValidationError;

/**
 * @throws {ParseError} if the config is invalid
 */
export const parseConfig = async (config: unknown): Promise<Config> => {
  const instance = plainToInstance(Config, config);

  try {
    await validateOrReject(instance);
  } catch (e) {
    if (Array.isArray(e) && e.every(isValidationError)) {
      throw new ParseError(e);
    }
    throw e;
  }

  return instance;
};
