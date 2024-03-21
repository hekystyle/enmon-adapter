import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { GetBlockchainInfoResult, getBlockchainInfoResult } from './rpc.schemas.js';
import { RpcConfig } from './config.js';

type Options = Partial<{
  id: string;
}>;

@Injectable()
export class RpcService {
  async getBlockchainInfo(config: RpcConfig, options?: Options): Promise<GetBlockchainInfoResult> {
    const response = await this.http(config).post('', {
      method: 'getblockchaininfo',
      params: [],
      id: options?.id,
    });

    return getBlockchainInfoResult.parse(response.data);
  }

  // eslint-disable-next-line class-methods-use-this
  private http(config: RpcConfig): AxiosInstance {
    return axios.create({
      responseType: 'json',
      baseURL: config.url,
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });
  }
}
