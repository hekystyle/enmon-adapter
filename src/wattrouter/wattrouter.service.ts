import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Decimal } from 'decimal.js';
import { AsyncLocalStorage } from 'async_hooks';
import { configProvider, type Config, ConfigWattrouter } from '../config/index.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { WATTrouterMxApiClient } from './MxApiClient.js';
import { CronExpression } from '../cron/expression.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { AlsValues, Host } from '../als/values-host.js';

@Injectable()
export class WATTrouterService {
  constructor(
    private readonly logger: ContextAwareLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly enmonApiClient: EnmonApiClient,
    private readonly wattRouterApiClient: WATTrouterMxApiClient,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
  ) {
    logger.setContext(WATTrouterService.name);
  }

  @Cron(CronExpression.Every15Minutes)
  public handleCron() {
    this.logger.debug({ method: this.handleCron.name });

    [this.config.wattrouter].forEach(this.processConfig.bind(this));
  }

  private processConfig(config: ConfigWattrouter, index: number) {
    this.als
      .run(
        new Host({
          jobId: `wattrouter-${index}`,
        }),
        () => this.sendValuesToEnmon(config),
      )
      .catch(this.handleRejection.bind(this));
  }

  private handleRejection(error: unknown) {
    this.logger.debug({ method: this.handleRejection.name });

    if (axios.isAxiosError<unknown>(error)) {
      const { statusText, status } = error.response ?? {};
      this.logger.error({
        error,
        status,
        statusText,
        data: error.response?.data,
      });
    } else {
      this.logger.error({ error });
    }
  }

  private async sendValuesToEnmon(config: ConfigWattrouter) {
    this.logger.log(this.sendValuesToEnmon.name);

    this.logger.log('fetching wattrouter stats...');
    const allTimeStats = await this.wattRouterApiClient.getAllTimeStats();

    this.logger.log('fetching wattrouter measurement...');
    const measurements = await this.wattRouterApiClient.getMeasurement();

    const { SAH4, SAL4, SAP4, SAS4 } = allTimeStats;
    this.logger.log({
      msg: 'fetched wattrouter stats & measurement',
      consumptionHT: SAH4,
      consumptionLT: SAL4,
      production: SAP4,
      surplus: SAS4,
      voltageL1: measurements.VAC,
    });

    const { devEUI } = config.enmon;

    const registersCounters = [
      [`1-1.8.0`, Decimal.sub(SAP4, SAS4).toNumber()], // consumption of own production
      [`1-1.8.2`, SAH4],
      [`1-1.8.3`, SAL4],
      [`1-1.8.4`, SAP4],
      [`1-2.8.0`, SAS4],
    ] as const;

    this.logger.log({
      msg: 'counters',
      registersCounters,
    });

    this.logger.log('posting consumption counters to Enmon...');

    const result = await this.enmonApiClient.postMeterPlainCounterMulti({
      config: config.enmon,
      payload: registersCounters.map(([meterRegister, counter]) => ({
        date: new Date(),
        devEUI,
        meterRegister,
        counter,
      })),
    });
    this.logger.log({ msg: 'posting consumption counters result', result });

    const payload = {
      meterRegister: `1-32.7.0`, // voltage on phase L1
      value: measurements.VAC,
    } as const;

    this.logger.log({ msg: 'posting voltage on phase L1 to Enmon...', payload });

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      config: config.enmon,
      payload: {
        date: new Date(),
        devEUI,
        ...payload,
      },
    });
    this.logger.log({ msg: 'posting voltage on phase L1 result', status, statusText, data });
  }
}
