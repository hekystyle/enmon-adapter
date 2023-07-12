import { configSchema, type Config } from './schemas.js';

/**
 * @throws {ZodError} if the config is invalid
 */
export const parseConfig = async (config: unknown): Promise<Config> => {
  return await configSchema.parseAsync(config);
};
