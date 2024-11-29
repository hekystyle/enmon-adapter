import { anyConfigSchema, type Config } from './schemas.js';

/**
 * @throws {ZodError} if the config is invalid
 */
export const parseConfig = async (rawConfig: unknown): Promise<Config> => {
  return await anyConfigSchema.parseAsync(rawConfig);
};
