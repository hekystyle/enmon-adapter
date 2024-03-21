import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { parseTemperature } from './utils/parseTemp.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import type { ConfigThermometer } from '../config/index.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';

@Injectable()
export class ThermometerUNI1xxx {
  constructor(
    private readonly logger: ContextAwareLogger,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    logger.setContext(ThermometerUNI1xxx.name);
  }

  public async handleTemperature(config: ConfigThermometer) {
    this.logger.log(this.handleTemperature.name);

    const temperature = await this.fetchTemperature(config);

    if (temperature) await this.uploadTemperature(temperature, config);
  }

  private async fetchTemperature(config: ConfigThermometer): Promise<undefined | number> {
    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(config.dataSourceUrl, {
      validateStatus: () => true,
    });

    this.logger.log({
      message: 'fetch temperature meter HTML page',
      status,
      statusText,
      html: status !== 200 ? html : '<hidden>',
    });

    if (status !== 200) return undefined;

    const serializedValue = parseTemperature(html);

    this.logger.log({
      message: 'founded serialized temperature value',
      serialized: serializedValue,
    });

    if (!serializedValue) return undefined;
    const temperature = parseFloat(serializedValue);

    this.logger.log({
      message: 'parsed temperature value',
      parsed: temperature,
    });

    return Number.isNaN(temperature) ? undefined : temperature;
  }

  private async uploadTemperature(temperature: number, config: ConfigThermometer): Promise<void> {
    const { devEUI } = config.enmon;

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      config: config.enmon,
      payload: {
        devEUI,
        date: new Date(),
        value: temperature,
      },
    });

    this.logger.log({ message: 'upload temperature result', status, statusText, data });
  }
}
