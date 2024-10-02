import { z } from 'zod';

export const measurementSchema = z.object({
  /** Voltage on phase L1 */
  VAC: z.number(),
});

export type Measurement = z.infer<typeof measurementSchema>;
