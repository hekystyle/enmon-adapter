import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Decimal } from 'decimal.js';
import { configProvider, type Config } from '../config/index.js';
import { Logger } from '../logger.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { WATTrouterMxApiClient } from './MxApiClient.js';
import { CronExpression } from '../cron/expression.js';

@Injectable()
export class WATTrouterService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly enmonApiClient: EnmonApiClient,
    private readonly wattRouterApiClient: WATTrouterMxApiClient,
  ) {
    this.logger = logger.extend(WATTrouterService.name);
  }

  @Cron(CronExpression.Every15Minutes)
  public triggerWattRouterValuesHandling() {
    this.logger.log(this.triggerWattRouterValuesHandling.name);
    this.handleWattRouterValues().catch(reason => this.logger.error(reason));
  }

  private async handleWattRouterValues() {
    this.logger.log(this.handleWattRouterValues.name);

    const allTimeStats = await this.getAllTimeStats();
    if (!allTimeStats) return;
    const measurements = await this.wattRouterApiClient.getMeasurement();
    const { SAH4, SAL4, SAP4, SAS4 } = allTimeStats;
    this.logger.log({
      msg: 'fetched wattrouter stats',
      consumptionHT: SAH4,
      consumptionLT: SAL4,
      production: SAP4,
      surplus: SAS4,
      voltageL1: measurements.VAC,
    });

    const { env, customerId, token, devEUI } = this.config.wattrouter.enmon;

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

    const readAt = new Date();

    try {
      const result = await this.enmonApiClient.postMeterPlainCounterMulti({
        env,
        customerId,
        token,
        payload: registersCounters.map(([meterRegister, counter]) => ({
          date: readAt,
          devEUI,
          meterRegister,
          counter,
        })),
      });
      this.logger.log({ msg: 'post meter plain counter multiple result', result });
    } catch (e) {
      if (axios.isAxiosError<unknown>(e)) {
        const { statusText, status } = e.response ?? {};
        this.logger.error({
          msg: 'failed to post multiple meter counters',
          status,
          statusText,
          data: e.response?.data,
        });
      } else {
        throw e;
      }
    }

    const payload = {
      meterRegister: `1-32.7.0`, // voltage on phase L1
      value: measurements.VAC,
    } as const;

    this.logger.log({ msg: 'voltage on phase L1', payload });

    try {
      const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
        env,
        customerId,
        token,
        payload: {
          date: readAt,
          devEUI,
          ...payload,
        },
      });
      this.logger.log({ msg: 'post meter plain value result', status, statusText, data });
    } catch (e) {
      if (axios.isAxiosError<unknown>(e)) {
        const { statusText, status } = e.response ?? {};
        this.logger.error({
          msg: 'failed to post meter value',
          status,
          statusText,
          data: e.response?.data,
        });
      } else {
        throw e;
      }
    }
  }

  private async getAllTimeStats() {
    try {
      return await this.wattRouterApiClient.getAllTimeStats();
    } catch (e) {
      if (axios.isAxiosError<unknown>(e)) {
        const { statusText, status } = e.response ?? {};
        this.logger.error({
          msg: 'failed to fetch wattrouter alltime stats',
          status,
          statusText,
          data: e.response?.data,
        });
      } else {
        throw e;
      }
      return undefined;
    }
  }
}
