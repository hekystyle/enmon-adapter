import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Config } from './config/types.js';
import { Logger } from './logger.js';
import { parseTemperature } from './utils/parseTemp.js';
import { EnmonApiClient } from './services/enmon.js';

@Injectable()
export class ThermometerService {
  private readonly logger: Logger;

  constructor(logger: Logger, private readonly config: Config) {
    this.logger = logger.extend(ThermometerService.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  triggerThermometerValueHandling() {
    this.logger.log(this.triggerThermometerValueHandling.name);
    this.handleTemperature().catch(reason => this.logger.error(reason));
  }

  private async handleTemperature() {
    this.logger.log(this.handleTemperature.name);

    const temperature = await this.fetchTemperature();

    if (temperature) await this.uploadTemperature(temperature);
  }

  private async fetchTemperature(): Promise<undefined | number> {
    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(this.config.thermometer.dataSourceUrl, {
      validateStatus: () => true,
    });

    this.logger.log({
      msg: 'fetch temperature meter HTML page',
      status,
      statusText,
      html: status !== 200 ? html : '<hidden>',
    });

    if (status !== 200) return undefined;

    const serializedValue = parseTemperature(html);

    this.logger.log({
      msg: 'founded serialized temperature value',
      serialized: serializedValue,
    });

    if (!serializedValue) return undefined;
    const temperature = parseFloat(serializedValue);

    this.logger.log({
      msg: 'parsed temperature value',
      parsed: temperature,
    });

    return Number.isNaN(temperature) ? undefined : temperature;
  }

  private async uploadTemperature(temperature: number): Promise<void> {
    const { env, customerId, devEUI, token } = this.config.thermometer.enmon;

    const client = new EnmonApiClient(env);

    const { status, statusText, data } = await client.postMeterPlainValue({
      customerId,
      token,
      payload: {
        devEUI,
        date: new Date(),
        value: temperature,
      },
    });

    this.logger.log({ msg: 'upload temperature result', status, statusText, data });
  }
}
