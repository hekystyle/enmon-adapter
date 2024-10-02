import { Injectable, Logger } from '@nestjs/common';
import { WATTrouterMxApiClient } from './mx-api-client.js';
import { ConfigWattRouter } from './config.schema.js';
import { Adapter } from './adapter.decorator.js';
import { WATTrouterModel } from './model.js';
import { IAdapter, WATTrouterValues } from './adapter.interface.js';

@Injectable()
@Adapter(WATTrouterModel.Mx)
export class WATTrouterMx implements IAdapter {
  private readonly logger = new Logger(WATTrouterMx.name);

  constructor(private readonly wattRouterMx: WATTrouterMxApiClient) {}

  async getValues(baseUrl: ConfigWattRouter['baseURL']): Promise<WATTrouterValues> {
    this.logger.log('fetching all time stats and measurements...');
    const [allTimeStats, measurement] = await Promise.all([
      this.wattRouterMx.getAllTimeStats(baseUrl),
      this.wattRouterMx.getMeasurement(baseUrl),
    ]);
    this.logger.log('all time stats and measurements fetched successfully');

    return { ...allTimeStats, ...measurement };
  }
}
