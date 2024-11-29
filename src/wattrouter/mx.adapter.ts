import { Inject, Injectable, Logger } from '@nestjs/common';
import { WATTrouterMxApiClient } from './mx-api-client.js';
import { ConfigWattRouter } from './config.schema.js';
import { Adapter } from './adapter.decorator.js';
import { WATTrouterModel } from './model.js';
import { IAdapter } from './adapter.interface.js';
import { Reading } from '../enmon/upload-reading.schema.js';

@Injectable()
@Adapter(WATTrouterModel.Mx)
export class MxAdapter implements IAdapter {
  private readonly logger = new Logger(MxAdapter.name);

  constructor(
    @Inject(WATTrouterMxApiClient)
    private readonly wattRouterMx: WATTrouterMxApiClient,
  ) {}

  async getReadings(baseUrl: ConfigWattRouter['baseURL']): Promise<Reading[]> {
    this.logger.log('fetching all time stats and measurements...');
    const [{ SAH4, SAL4, SAP4, SAS4 }, { VAC }] = await Promise.all([
      this.wattRouterMx.getAllTimeStats(baseUrl),
      this.wattRouterMx.getMeasurement(baseUrl),
    ]);
    this.logger.log('all time stats and measurements fetched successfully');

    const readAt = new Date();

    return [
      { readAt, register: `1-1.8.2`, value: SAH4 },
      { readAt, register: `1-1.8.3`, value: SAL4 },
      { readAt, register: `1-1.8.4`, value: SAP4 },
      { readAt, register: `1-2.8.0`, value: SAS4 },
      { readAt, register: `1-32.7.0`, value: VAC },
    ];
  }
}
