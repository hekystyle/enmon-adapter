// NOTE: I prefix prevents naming collision with decorator
/** Thermometer adapter interface. */
export interface IAdapter {
  getTemperatures(dataSourceUrl: string): Promise<number[]>;
}

export const isIAdapter = (value: unknown): value is IAdapter =>
  value !== null &&
  typeof value === 'object' &&
  ('getTemperatures' satisfies keyof IAdapter) in value &&
  typeof value.getTemperatures === 'function';
