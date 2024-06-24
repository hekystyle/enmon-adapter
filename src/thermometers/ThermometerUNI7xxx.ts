import axios from 'axios';
import { load } from 'cheerio';
import { Injectable } from '@nestjs/common';
import { Logger } from '../logger.js';
import { Thermometer } from './thermometer.decorator.js';
import { ThermometerModel } from '../config/schemas.js';

@Injectable()
@Thermometer(ThermometerModel.UNI7xxx)
export class ThermometerUNI7xxx {
  constructor(private readonly logger: Logger) {
    this.logger = logger.extend(ThermometerUNI7xxx.name);
  }

  async fetchTemperatures(dataSourceUrl: string): Promise<number[]> {
    this.logger.log({ msg: 'fetching temperature meter HTML page' });

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

    if (status !== 200) throw new Error(`fetch temperature meter HTML page failed: ${statusText} (${status})`);

    const temperatures = this.parseTemperatures(html);

    this.logger.log({
      msg: 'parsed temperature value',
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
      msg: 'found serialized temperature values',
      serialized: serializedValues,
    });

    return serializedValues.map(serializedValue => {
      if (!serializedValue) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      const parsedValue = parseFloat(serializedValue);

      if (Number.isNaN(parsedValue)) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      return parsedValue;
    });
  }
}
