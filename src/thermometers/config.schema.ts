import { z } from 'zod';
import { configEnmonSchema } from '../enmon/config.schema.js';
import { ThermometerModel } from './model.enum.js';

export const configThermometerSchema = z.object({
  model: z.nativeEnum(ThermometerModel),
  dataSourceUrl: z.string().url(),
  enmon: configEnmonSchema,
});

export type ConfigThermometer = z.infer<typeof configThermometerSchema>;
