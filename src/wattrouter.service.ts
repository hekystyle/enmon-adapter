import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Decimal } from 'decimal.js';
import { Config } from './config/types.js';
import { Logger } from './logger.js';
import { EnmonApiClient } from './services/enmon.js';
import { WATTrouterMxApiClient } from './services/wattrouter.js';

@Injectable()
export class WATTrouterService {
  private readonly logger: Logger;

  constructor(logger: Logger, private readonly config: Config) {
    this.logger = logger.extend(WATTrouterService.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public triggerWattrouterValuesHandling() {
    this.logger.log(this.triggerWattrouterValuesHandling.name);
    this.handleWattrouterValues().catch(reason => this.logger.error(reason));
  }

  private async handleWattrouterValues() {
    this.logger.log(this.handleWattrouterValues.name);

    const wattrouterApiClient = new WATTrouterMxApiClient(this.config.wattrouter.baseURL);
    const allTimeStats = await this.getAllTimeStats(wattrouterApiClient);
    if (!allTimeStats) return;
    const measurements = await wattrouterApiClient.getMeasurement();
    const { SAH4, SAL4, SAP4, SAS4 } = allTimeStats;
    this.logger.log({
      msg: 'fetched wattrouter stats',
      consumptionHT: SAH4,
      consumptionLT: SAL4,
      production: SAP4,
      surplus: SAS4,
      voltageL1: measurements.VAC,
    });

    const { customerId, token, devEUI } = this.config.wattrouter.enmon;

    const legacyCounters = [
      [`consumption-ht`, SAH4],
      [`consumption-lt`, SAL4],
      [`production`, SAP4],
      [`surplus`, SAS4],
    ] as const;

    const registersCounters = [
      [`1-1.8.0`, Decimal.sub(SAP4, SAS4).toNumber()], // consumption of own production
      [`1-1.8.2`, SAH4],
      [`1-1.8.3`, SAL4],
      [`1-2.8.0`, SAS4],
    ] as const;

    this.logger.log({
      msg: 'counters',
      legacyCounters,
      registersCounters,
    });

    const enmonApiClient = new EnmonApiClient(this.config.wattrouter.enmon.env);

    try {
      const result = await enmonApiClient.postMeterPlainCounterMulti({
        customerId,
        token,
        payload: [
          ...legacyCounters.map(([type, counter]) => ({
            date: new Date(),
            devEUI: `${devEUI}-${type}`,
            counter,
          })),
          ...registersCounters.map(([meterRegister, counter]) => ({
            date: new Date(),
            devEUI,
            meterRegister,
            counter,
          })),
        ],
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
      const { status, statusText, data } = await enmonApiClient.postMeterPlainValue({
        customerId,
        token,
        payload: {
          date: new Date(),
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

  private async getAllTimeStats(client: WATTrouterMxApiClient) {
    try {
      return await client.getAllTimeStats();
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