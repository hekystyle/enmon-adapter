import { z } from 'zod';
import { Schema, SchemaTypes } from 'mongoose';
import { EnmonEnv } from './env.enum.js';
import { ConfigEnmon, configEnmonSchema } from './config.schema.js';

export const Reading = z.object({
  register: z.string(),
  value: z.number(),
  readAt: z
    .string()
    .datetime()
    .transform(v => new Date(v)),
});

export type Reading = z.infer<typeof Reading>;

export const UploadReading = z.object({
  reading: Reading,
  config: configEnmonSchema,
});

export type UploadReading = z.infer<typeof UploadReading>;

export const UPLOAD_READING_MODEL_NAME = 'UploadReading';

export const UploadReadingSchema = new Schema<UploadReading>({
  reading: new Schema<Reading>({
    register: SchemaTypes.String,
    value: SchemaTypes.Number,
    readAt: SchemaTypes.Date,
  }),
  config: new Schema<ConfigEnmon>({
    env: {
      type: SchemaTypes.String,
      enum: Object.values(EnmonEnv),
    },
    customerId: SchemaTypes.ObjectId,
    devEUI: SchemaTypes.String,
    token: SchemaTypes.String,
  }),
});
