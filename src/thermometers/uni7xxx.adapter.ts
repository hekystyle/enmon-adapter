import axios from 'axios';
import { load } from 'cheerio';
import { Injectable, Logger } from '@nestjs/common';
import { Adapter } from './adapter.decorator.js';
import { ThermometerModel } from './model.enum.js';
import { IAdapter } from './adapter.interface.js';

@Injectable()
@Adapter(ThermometerModel.UNI7xxx)
export class UNI7xxxAdapter implements IAdapter {
  private readonly logger = new Logger(UNI7xxxAdapter.name);

  async getTemperatures(dataSourceUrl: string): Promise<number[]> {
    this.logger.log('fetching temperature meter HTML page');

    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(dataSourceUrl, {
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
      if (!serializedValue) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      const parsedValue = parseFloat(serializedValue);

      if (Number.isNaN(parsedValue)) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      return parsedValue;
    });
  }
}
