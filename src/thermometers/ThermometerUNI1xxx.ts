import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { parseTemperature } from './utils/parseTemp.js';
import { ThermometerModel } from '../config/schemas.js';
import { Thermometer } from './thermometer.decorator.js';

@Injectable()
@Thermometer(ThermometerModel.UNI1xxx)
export class ThermometerUNI1xxx {
  private readonly logger = new Logger(ThermometerUNI1xxx.name);

  async fetchTemperatures(dataSourceUrl: string): Promise<number[]> {
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

    const serializedValue = parseTemperature(html);

    this.logger.log({
      message: 'founded serialized temperature value',
      serialized: serializedValue,
    });

    if (!serializedValue) return [];
    const temperature = parseFloat(serializedValue);

    this.logger.log({
      message: 'parsed temperature value',
      parsed: temperature,
    });

    return Number.isNaN(temperature) ? [] : [temperature];
  }
}
