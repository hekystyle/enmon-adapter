import axios, { AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';

export interface AllTimeStats {
  /** Counted from this date in format YYYY-MM-DD */
  SAD: string;
  /** Surplus on Phase L1 in kWh */
  SAS1: string;
  /** Consumption in high tariff on Phase L1 in kWh */
  SAH1: string;
  /** Consumption in low tariff on Phase L1 in kWh */
  SAL1: string;
  /** Production on Phase L1 in kWh */
  SAP1: string;
  /** Surplus on Phase L2 in kWh */
  SAS2: string;
  /** Consumption in high tariff on Phase L2 in kWh */
  SAH2: string;
  /** Consumption in low tariff on Phase L2 in kWh */
  SAL2: string;
  /** Production on Phase L2 in kWh */
  SAP2: string;
  /** Surplus on Phase L3 in kWh */
  SAS3: string;
  /** Consumption in high tariff on Phase L3 in kWh */
  SAH3: string;
  /** Consumption in low tariff on Phase L3 in kWh */
  SAL3: string;
  /** Production on Phase L3 in kWh */
  SAP3: string;
  /** Surplus on Phase L1+L2+L3 in kWh */
  SAS4: string;
  /** Consumption in high tariff on Phase L1+L2+L3 in kWh */
  SAH4: string;
  /** Consumption in low tariff on Phase L1+L2+L3 in kWh */
  SAL4: string;
  /** Production on Phase L1+L2+L3 in kWh */
  SAP4: string;
}

interface AllTimeStatsShape {
  // eslint-disable-next-line camelcase
  stat_alltime: AllTimeStats;
}

export class WATTrouterMxApiClient {
  private http: AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
    });
  }

  async getAllTimeStats(): Promise<AllTimeStats> {
    const response = await this.http.get<string>('stat_alltime.xml');
    const result = (await parseStringPromise(response.data, {
      explicitArray: false,
    })) as unknown as AllTimeStatsShape;
    return result.stat_alltime;
  }
}
