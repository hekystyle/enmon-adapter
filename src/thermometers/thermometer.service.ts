import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Config, ConfigThermometerV1 } from '../config/types.js';
import { Logger } from '../logger.js';
import { parseTemperature } from './utils/parseTemp.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';

/**
 * @deprecated Use {@link ThermometerUNI1xxx} instead.
 */
@Injectable()
export class ThermometerService {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    private readonly config: Config,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    this.logger = logger.extend(ThermometerService.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  triggerThermometerValueHandling(): void {
    this.logger.log(this.triggerThermometerValueHandling.name);
    const config = this.config.thermometer;
    if (config) {
      this.handleTemperature(config).catch(reason => this.logger.error(reason));
    } else {
      this.logger.warn('legacy thermometer config is not defined');
    }
  }

  private async handleTemperature(config: ConfigThermometerV1) {
    this.logger.log(this.handleTemperature.name);

    const temperature = await this.fetchTemperature(config);

    if (temperature) await this.uploadTemperature(config, temperature);
  }

  private async fetchTemperature(config: ConfigThermometerV1): Promise<undefined | number> {
    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(config.dataSourceUrl, {
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

  private async uploadTemperature(config: ConfigThermometerV1, temperature: number): Promise<void> {
    const { env, customerId, devEUI, token } = config.enmon;

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      env,
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
