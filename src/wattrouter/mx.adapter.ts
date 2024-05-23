import { Injectable } from '@nestjs/common';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { WATTrouterMxApiClient } from './mx-api-client.js';
import { WATTrouterValues, WATTrouterAdapter } from './adapter.interfaces.js';
import { IsWATTrouterAdapter } from './adapter.decorator.js';
import { WATTRouterModel } from './model.enum.js';

@Injectable()
@IsWATTrouterAdapter()
export class WATTrouterMxAdapter implements WATTrouterAdapter {
  readonly model = WATTRouterModel.Mx;

  constructor(
    private readonly logger: ContextAwareLogger,
    private readonly apiClient: WATTrouterMxApiClient,
  ) {
    logger.setContext(WATTrouterMxAdapter.name);
  }

  public async getValues(): Promise<WATTrouterValues> {
    this.logger.debug({ method: this.getValues.name });

    this.logger.log('fetching wattrouter stats & measurements...');
    const [allTimeStats, measurements] = await Promise.all([
      this.apiClient.getAllTimeStats(),
      this.apiClient.getMeasurement(),
    ]);

    return {
      SAH4: allTimeStats.SAH4,
      SAL4: allTimeStats.SAL4,
      SAP4: allTimeStats.SAP4,
      SAS4: allTimeStats.SAS4,
      voltageL1: measurements.VAC,
    };
  }
}
