import { type AxiosInstance } from 'axios';
import { parseAllTimeStats } from './utils/parseAllTimeStats.js';
import { parseMeasurement } from './utils/parseMeasurement.js';
import type { AllTimeStats } from './all-time-stats.schema.js';
import { Measurement } from './measurement.schema.js';

export class WATTrouterMxApiClient {
  constructor(private http: AxiosInstance) {}

  async getAllTimeStats(origin: URL['origin']): Promise<AllTimeStats> {
    const response = await this.http.get<string>('stat_alltime.xml', {
      baseURL: origin,
      responseType: 'text',
      headers: {
        Accept: 'text/xml',
      },
    });

    return await parseAllTimeStats(response.data);
  }

  async getMeasurement(origin: URL['origin']): Promise<Measurement> {
    const response = await this.http.get<string>('meas.xml', {
      baseURL: origin,
      responseType: 'text',
      headers: {
        Accept: 'text/xml',
      },
    });
    return await parseMeasurement(response.data);
  }
}
