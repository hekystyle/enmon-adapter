import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { EnmonEnv } from './env.enum.js';

type PlainDataPoint = {
  devEUI: string;
  date: Date;
  meterRegister?: string;
} & ({ value: number } | { counter: number });

export interface PostMeterCounterArgs {
  env: EnmonEnv | undefined;
  payload: PlainDataPoint[];
  customerId: string;
  token: string;
}

interface ValidationErrorItem {
  message: string;
  path: Array<string | number>;
  type: string;
}

interface PostMeterPlainCounterMultiResult {
  successCount: number;
  errorCount: number;
  errorDocs: Array<PlainDataPoint & { error: string | ValidationErrorItem[] }>;
}

export interface PostMeterPlainValueArgs {
  env: EnmonEnv | undefined;
  payload: PlainDataPoint;
  customerId: string;
  token: string;
}

export class EnmonApiClient {
  constructor(public readonly contactEmail: string | undefined) {}

  async postMeterPlainCounterMulti({
    env,
    customerId,
    token,
    payload,
  }: PostMeterCounterArgs): Promise<PostMeterPlainCounterMultiResult> {
    const result = await this.http({ env }).post<PostMeterPlainCounterMultiResult>(
      `meter/plain/${customerId}/counter-multi`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: status => status >= 200 && status < 300,
      },
    );
    return result.data;
  }

  async postMeterPlainValue({
    env,
    customerId,
    token,
    payload,
  }: PostMeterPlainValueArgs): Promise<AxiosResponse<void>> {
    return await this.http({ env }).post<void>(`meter/plain/${customerId}/value`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private http({ env }: { env?: EnmonEnv | undefined }): AxiosInstance {
    return axios.create({
      baseURL: `https://${env ?? EnmonEnv.App}.enmon.tech`,
      headers: {
        'User-Agent': `enmon-adapter (${this.contactEmail ?? '<email not provided>'})`,
      },
    });
  }
}
