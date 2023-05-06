import axios, { type AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { parseAllTimeStats } from './utils/parseAllTimeStats.js';
import { parseMeasurement } from './utils/parseMeasurement.js';
import type { AllTimeStats, Measurement } from './types.js';

export class WATTrouterMxApiClient {
  private http: AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
    });
  }

  async getAllTimeStats(): Promise<AllTimeStats> {
    const response = await this.http.get<string>('stat_alltime.xml', {
      responseType: 'text',
      headers: {
        Accept: 'text/xml',
      },
    });
    const plain: unknown = await parseStringPromise(response.data, { explicitArray: false });
    return await parseAllTimeStats(plain);
  }

  async getMeasurement(): Promise<Measurement> {
    const response = await this.http.get<string>('meas.xml', {
      responseType: 'text',
      headers: {
        Accept: 'text/xml',
      },
    });
    return await parseMeasurement(response.data);
  }
}
