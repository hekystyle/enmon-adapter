import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { WATTrouterUploader } from '../wattrouter/uploader.interface.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { EnmonApiClient } from './ApiClient.js';
import { WATTrouterValues } from '../wattrouter/adapter.interfaces.js';
import { INTEGRATION_ID } from './constants.js';
import { IsWATTrouterUploader } from '../wattrouter/uploader.decorator.js';
import { EnmonIntegrationConfig } from './config.schema.js';

@Injectable()
@IsWATTrouterUploader()
export class EnmonWATTRouterUploader implements WATTrouterUploader {
  public readonly integrationId = INTEGRATION_ID;

  constructor(
    private readonly logger: ContextAwareLogger,
    private readonly enmonApiClient: EnmonApiClient,
  ) {}

  public async upload(values: WATTrouterValues, config: EnmonIntegrationConfig) {
    const { SAH4, SAL4, SAP4, SAS4, voltageL1 } = values;
    this.logger.log({
      message: 'fetched WATTrouter stats & measurement',
      consumptionHT: SAH4,
      consumptionLT: SAL4,
      production: SAP4,
      surplus: SAS4,
      voltageL1,
    });

    const { dataSourceId } = config;

    const registersCounters = [
      [`1-1.8.0`, Decimal.sub(SAP4, SAS4).toNumber()], // consumption of own production
      [`1-1.8.2`, SAH4],
      [`1-1.8.3`, SAL4],
      [`1-1.8.4`, SAP4],
      [`1-2.8.0`, SAS4],
    ] as const;

    this.logger.log({
      message: 'counters',
      registersCounters,
    });

    this.logger.log('posting consumption counters to Enmon...');

    const result = await this.enmonApiClient.postMeterPlainCounterMulti({
      config,
      payload: registersCounters.map(([meterRegister, counter]) => ({
        date: new Date(),
        devEUI: dataSourceId,
        meterRegister,
        counter,
      })),
    });
    this.logger.log({ message: 'posting consumption counters result', result });

    const payload = {
      meterRegister: `1-32.7.0`, // voltage on phase L1
      value: values.voltageL1,
    } as const;

    this.logger.log({ message: 'posting voltage on phase L1 to Enmon...', payload });

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      config,
      payload: {
        date: new Date(),
        devEUI: dataSourceId,
        ...payload,
      },
    });
    this.logger.log({ message: 'posting voltage on phase L1 result', status, statusText, data });
  }
}
