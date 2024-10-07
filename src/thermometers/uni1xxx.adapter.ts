import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { load } from 'cheerio/slim';
import { Adapter } from './adapter.decorator.js';
import { ThermometerModel } from './model.enum.js';
import { IAdapter } from './adapter.interface.js';

@Injectable()
@Adapter(ThermometerModel.UNI1xxx)
export class UNI1xxxAdapter implements IAdapter {
  private readonly logger = new Logger(UNI1xxxAdapter.name);

  async getTemperatures(dataSourceUrl: string): Promise<number[]> {
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

    if (status !== 200) return [];

    const temperature = this.parseTemperature(html);

    return temperature === undefined ? [] : [temperature];
  }

  parseTemperature(html: string): number | undefined {
    const $ = load(html);
    const [serializedValue] = $('#main > form > p:nth-child(3) > span').text().split(' ');

    this.logger.log({
      message: 'found serialized temperature value',
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
}
