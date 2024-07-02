import { Queue } from 'bull';
import { z } from 'zod';
import { configEnmonSchema } from './config.schema.js';

export const Reading = z.object({
  register: z.string(),
  value: z.number(),
  readAt: z.string().datetime(),
});

export type Reading = z.infer<typeof Reading>;

export const UploadJobData = z.object({
  reading: Reading,
  config: configEnmonSchema,
});

export type UploadJobData = z.infer<typeof UploadJobData>;

export const READINGS_QUEUE_NAME = 'readings';

export type ReadingsQueue = Queue<UploadJobData>;

export const UPLOAD_JOB_NAME = 'upload';
