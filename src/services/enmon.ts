import axios, { AxiosInstance } from 'axios';

export enum EnmonEnv {
  App = 'app',
  Dev = 'dev',
}

type PlainDataPoint = {
  devEUI: string;
  counter: number;
  date: Date;
} & ({ value: number } | { counter: number });

export interface PostMeterCounterArgs {
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
  errorDocs: (PlainDataPoint & { error: string | ValidationErrorItem[] })[];
}

export class EnmonApiClient {
  private http: AxiosInstance;

  constructor(env: EnmonEnv) {
    this.http = axios.default.create({
      baseURL: `https://${env}.enmon.tech`,
    });
  }

  async postMeterPlainCounterMulti({
    customerId,
    token,
    payload,
  }: PostMeterCounterArgs): Promise<PostMeterPlainCounterMultiResult> {
    const result = await this.http.post<PostMeterPlainCounterMultiResult>(
      `meter/plain/${customerId}/counter-multi`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: status => (status >= 200 && status < 300) || status === 412,
      },
    );
    return result.data;
  }
}
