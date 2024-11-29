import { z } from 'zod';
import { configWattRouterSchemas } from '../wattrouter/config.schema.js';
import { configThermometerSchema } from '../thermometers/config.schema.js';

export const configSchemas = {
  /**
   * @deprecated Don't use for new schema, use latest instead.
   */
  legacyV1: z
    .object({
      DEV: z.boolean(),
      thermometers: z.array(configThermometerSchema).nullish(),
      wattrouter: configWattRouterSchemas.legacyV1.nullish(),
    })
    .transform(c => ({ ...c, version: '1' as const })),
  /**
   * @deprecated Don't use for new schema, use latest instead.
   */
  legacyV2: z
    .object({
      version: z.literal('2').optional().default('2'),
      DEV: z.boolean(),
      thermometers: z.array(configThermometerSchema).nullish(),
      wattrouter: configWattRouterSchemas.latest.nullish(),
    })
    .transform(c => ({ ...c, version: '2' as const })),
  latest: z
    .object({
      DEV: z.boolean(),
      db: z.object({
        uri: z.string().url(),
      }),
      enmon: z.object({
        contactEmail: z.string().email().optional(),
      }),
      thermometers: z
        .array(configThermometerSchema)
        .nullish()
        .transform(v => v ?? []),
      wattrouters: z
        .array(configWattRouterSchemas.latest)
        .nullish()
        .transform(v => v ?? []),
    })
    .transform(c => ({ ...c, version: 'latest' as const })),
};

export const anyConfigSchema = z
  .union([configSchemas.latest, configSchemas.legacyV2, configSchemas.legacyV1])
  .transform(config => {
    switch (config.version) {
      case 'latest':
        return config;
      case '2':
        return {
          version: config.version,
          DEV: config.DEV,
          db: { uri: 'mongodb://db/enmon-adapter' },
          enmon: {},
          thermometers: config.thermometers ?? [],
          wattrouters: config.wattrouter
            ? [
                {
                  baseURL: config.wattrouter.baseURL,
                  model: config.wattrouter.model,
                  targets: config.wattrouter.targets,
                },
              ]
            : [],
        };
      case '1':
        return {
          version: config.version,
          DEV: config.DEV,
          db: { uri: 'mongodb://db/enmon-adapter' },
          enmon: {},
          thermometers: config.thermometers ?? [],
          wattrouters: config.wattrouter
            ? [
                {
                  baseURL: config.wattrouter.baseURL,
                  model: config.wattrouter.model,
                  targets: [config.wattrouter.enmon],
                },
              ]
            : [],
        };
      default:
        throw new Error(`Schema migration not implemented`);
    }
  });

export type InputConfig = z.input<typeof anyConfigSchema>;

type Version = Pick<z.output<typeof anyConfigSchema>, 'version'>;

export type Config = Omit<z.output<typeof configSchemas.latest>, keyof Version> & Version;
