import axios, { AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { parseAllTimeStats } from './wattrouter/parse.js';
import type { AllTimeStats } from './wattrouter/types.js';

export class WATTrouterMxApiClient {
  private http: AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.default.create({
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
    const plain: unknown = await parseStringPromise(response.data);
    return await parseAllTimeStats(plain);
  }
}
