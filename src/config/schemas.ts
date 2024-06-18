import { z } from 'zod';
import { EnmonEnv } from '../enmon/ApiClient.js';
import { WATTrouterModel } from '../wattrouter/model.js';

export enum ThermometerModel {
  UNI7xxx = 'UNI7xxx',
  UNI1xxx = 'UNI1xxx',
}

export const configEnmonSchema = z.object({
  env: z.nativeEnum(EnmonEnv),
  customerId: z.string(),
  devEUI: z.string(),
  token: z.string(),
});

const configThermometerSchema = z.object({
  model: z.nativeEnum(ThermometerModel),
  dataSourceUrl: z.string().url(),
  enmon: configEnmonSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;

const configWattRouterSchema = z
  .object({
    model: z.nativeEnum(WATTrouterModel).optional(),
    baseURL: z.string().url(),
    /**
     * @deprecated Use `targets` instead.
     */
    enmon: configEnmonSchema.optional(),
    targets: z.array(configEnmonSchema).optional(),
  })
  .transform(({ enmon, targets, ...data }) => {
    return {
      ...data,
      targets: targets ?? (enmon ? [enmon] : []),
    };
  });

export type ConfigWattRouter = z.infer<typeof configWattRouterSchema>;

export const configSchema = z
  .object({
    thermometers: z
      .array(configThermometerSchema)
      .nullish()
      .transform(v => v ?? []),
    wattrouter: configWattRouterSchema.nullish(),
    wattrouters: z
      .array(configWattRouterSchema)
      .nullish()
      .transform(v => v ?? []),
  })
  .transform(({ thermometers, wattrouters, wattrouter }) => {
    return {
      thermometers,
      wattrouters: wattrouters ?? (wattrouter ? [wattrouter] : []),
    };
  });

export type InputConfig = z.input<typeof configSchema>;
export type Config = z.output<typeof configSchema>;
