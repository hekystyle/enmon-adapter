import { type AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { parseAllTimeStats } from './utils/parseAllTimeStats.js';
import { parseMeasurement } from './utils/parseMeasurement.js';
import type { AllTimeStats, Measurement } from './schemas.js';

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
    const plain: unknown = await parseStringPromise(response.data, { explicitArray: false });
    return await parseAllTimeStats(plain);
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
