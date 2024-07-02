import { z } from 'zod';

export const allTimeStatsSchema = z.object({
  /** Counted from this date in format YYYY-MM-DD */
  SAD: z.string(),

  /** Surplus on Phase L1 in kWh */
  SAS1: z.coerce.number(),

  /** Consumption in high tariff on Phase L1 in kWh */
  SAH1: z.coerce.number(),

  /** Consumption in low tariff on Phase L1 in kWh */
  SAL1: z.coerce.number(),

  /** Production on Phase L1 in kWh */
  SAP1: z.coerce.number(),

  /** Surplus on Phase L2 in kWh */
  SAS2: z.coerce.number(),

  /** Consumption in high tariff on Phase L2 in kWh */
  SAH2: z.coerce.number(),

  /** Consumption in low tariff on Phase L2 in kWh */
  SAL2: z.coerce.number(),

  /** Production on Phase L2 in kWh */
  SAP2: z.coerce.number(),

  /** Surplus on Phase L3 in kWh */
  SAS3: z.coerce.number(),

  /** Consumption in high tariff on Phase L3 in kWh */
  SAH3: z.coerce.number(),

  /** Consumption in low tariff on Phase L3 in kWh */
  SAL3: z.coerce.number(),

  /** Production on Phase L3 in kWh */
  SAP3: z.coerce.number(),

  /** Surplus on Phase L1+L2+L3 in kWh */
  SAS4: z.coerce.number(),

  /** Consumption in high tariff on Phase L1+L2+L3 in kWh */
  SAH4: z.coerce.number(),

  /** Consumption in low tariff on Phase L1+L2+L3 in kWh */
  SAL4: z.coerce.number(),

  /** Production on Phase L1+L2+L3 in kWh */
  SAP4: z.coerce.number(),
});

export type AllTimeStats = z.infer<typeof allTimeStatsSchema>;

export const allTimeStatsShapeSchema = z.object({
  // eslint-disable-next-line camelcase -- can't change the name of the key
  stat_alltime: allTimeStatsSchema,
});

export type AllTimeStatsShape = z.infer<typeof allTimeStatsShapeSchema>;

export const measurementSchema = z.object({
  /** Voltage on Phase L1 */
  VAC: z.coerce.number(),
});

export type MeasurementShape = z.infer<typeof measurementShapeSchema>;

export type Measurement = z.infer<typeof measurementSchema>;

export const measurementShapeSchema = z.object({
  meas: measurementSchema,
});
