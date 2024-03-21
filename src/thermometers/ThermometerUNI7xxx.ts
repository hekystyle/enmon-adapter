import axios from 'axios';
import { load } from 'cheerio';
import { Injectable } from '@nestjs/common';
import { type ConfigThermometer } from '../config/index.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';

@Injectable()
export class ThermometerUNI7xxx {
  constructor(
    private readonly logger: ContextAwareLogger,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    logger.setContext(ThermometerUNI7xxx.name);
  }

  public async handleTemperature(config: ConfigThermometer) {
    const temperatures = await this.fetchTemperature(config);

    await this.uploadTemperatures(temperatures, config);
  }

  private async fetchTemperature(config: ConfigThermometer): Promise<number[]> {
    this.logger.log({ message: 'fetching temperature meter HTML page' });

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

    if (status !== 200) throw new Error(`fetch temperature meter HTML page failed: ${statusText} (${status})`);

    const temperatures = this.parseTemperatures(html);

    this.logger.log({
      message: 'parsed temperature value',
      parsed: temperatures,
    });

    return temperatures;
  }

  private parseTemperatures(html: string): number[] {
    const $ = load(html);

    const serializedValues = ([3, 4, 5] as const).map(offset => {
      const [serializedTempValue] = $(`body > p:nth-child(${offset})`).text().split(' ');
      return serializedTempValue;
    });

    this.logger.log({
      message: 'found serialized temperature values',
      serialized: serializedValues,
    });

    return serializedValues.map(serializedValue => {
      if (!serializedValue) throw new Error(`failed to parse temperature value: ${serializedValue as string}`);

      const parsedValue = parseFloat(serializedValue);

      if (Number.isNaN(parsedValue)) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      return parsedValue;
    });
  }

  private async uploadTemperatures(temperatures: number[], config: ConfigThermometer): Promise<void> {
    const { devEUI } = config.enmon;

    await Promise.all(
      temperatures.map(async (temperature, index) => {
        const payload = {
          devEUI,
          date: new Date(),
          value: temperature,
          meterRegister: `20-1.0.${index}`,
        } as const;

        this.logger.log({ message: 'uploading temperature ...', payload });

        const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
          config: config.enmon,
          payload,
        });

        this.logger.log({ message: 'upload temperature result', payload, status, statusText, data });
      }),
    );
  }
}
