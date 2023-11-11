import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { parseTemperature } from './utils/parseTemp.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { ConfigThermometer } from '../config/schemas.js';

@Injectable()
export class ThermometerUNI1xxx {
  private readonly logger = new Logger(ThermometerUNI1xxx.name);

  constructor(private readonly enmonApiClient: EnmonApiClient) {}

  public async process(config: ConfigThermometer) {
    this.logger.log(this.process.name);

    const temperature = await this.fetchTemperature(config.dataSourceUrl);

    if (temperature) await this.uploadTemperature(config.enmon, temperature);
  }

  private async fetchTemperature(dataSourceUrl: string): Promise<undefined | number> {
    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(dataSourceUrl, {
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

  private async uploadTemperature(config: ConfigThermometer['enmon'], temperature: number): Promise<void> {
    const { env, customerId, devEUI, token } = config;

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
