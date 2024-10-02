import { z } from 'zod';

export const allTimeStatsSchema = z.object({
  /** Surplus on phase L1+L2+L3 in kWh */
  SAS4: z.number(),

  /** Consumption in high tariff on phase L1+L2+L3 in kWh */
  SAH4: z.number(),

  /** Consumption in low tariff on phase L1+L2+L3 in kWh */
  SAL4: z.number(),

  /** Production on phase L1+L2+L3 in kWh */
  SAP4: z.number(),
});

export type AllTimeStats = z.infer<typeof allTimeStatsSchema>;
