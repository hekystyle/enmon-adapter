import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import assert from 'assert';
import { EnmonIntegrationBaseConfig } from './config.schema.js';

interface ConfigProp {
  config: Partial<EnmonIntegrationBaseConfig> | undefined;
}

type PlainDataPoint = {
  devEUI: string;
  date: Date;
  meterRegister?: string;
} & ({ value: number } | { counter: number });

export interface PostMeterCounterArgs extends ConfigProp {
  payload: PlainDataPoint[];
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

export interface PostMeterPlainValueArgs extends ConfigProp {
  payload: PlainDataPoint;
}

export class EnmonApiClient {
  constructor(public readonly config: EnmonIntegrationBaseConfig | undefined) {}

  async postMeterPlainCounterMulti(args: PostMeterCounterArgs): Promise<PostMeterPlainCounterMultiResult> {
    const { payload, config } = args;

    const selectedCustomerId = this.config?.customerId ?? config?.customerId;

    assert(
      selectedCustomerId,
      `${'customerId' satisfies keyof EnmonIntegrationBaseConfig} must be set globally or passed as a parameter`,
    );

    const result = await this.http(config).post<PostMeterPlainCounterMultiResult>(
      `meter/plain/${selectedCustomerId}/counter-multi`,
      payload,
      {
        validateStatus: status => (status >= 200 && status < 300) || status === 412,
      },
    );
    return result.data;
  }

  async postMeterPlainValue(args: PostMeterPlainValueArgs): Promise<AxiosResponse<void>> {
    const { payload, config } = args;

    const selectedCustomerId = this.config?.customerId ?? config?.customerId;

    assert(
      selectedCustomerId,
      `${'customerId' satisfies keyof EnmonIntegrationBaseConfig} must be set globally or passed as a parameter`,
    );

    return await this.http(config).post<void>(`meter/plain/${selectedCustomerId}/value`, payload, {
      validateStatus: () => true,
    });
  }

  private http(config: Partial<EnmonIntegrationBaseConfig> | undefined): AxiosInstance {
    const selectedEnv = this.config?.env ?? config?.env;
    const selectedToken = this.config?.token ?? config?.token;

    assert(
      selectedEnv,
      `${'env' satisfies keyof EnmonIntegrationBaseConfig} must be set globally or passed as a parameter`,
    );
    assert(
      selectedToken,
      `${'token' satisfies keyof EnmonIntegrationBaseConfig} must be set globally or passed as a parameter`,
    );

    return axios.create({
      baseURL: `https://${selectedEnv}.enmon.tech`,
      headers: {
        Authorization: `Bearer ${selectedToken}`,
      },
    });
  }
}
