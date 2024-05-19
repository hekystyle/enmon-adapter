import axios from 'axios';
import { load } from 'cheerio';
import { Injectable } from '@nestjs/common';
import { type ConfigThermometer } from '../config/index.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { Thermometer } from './interfaces.js';

@Injectable()
export class ThermometerUNI7xxx implements Thermometer {
  readonly model = 'UNI7xxx';

  constructor(private readonly logger: ContextAwareLogger) {
    logger.setContext(ThermometerUNI7xxx.name);
  }

  async getTemperatures(config: ConfigThermometer): Promise<number[]> {
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
}
