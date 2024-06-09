export interface Thermometer {
  fetchTemperatures(dataSourceUrl: string): Promise<number[]>;
}
