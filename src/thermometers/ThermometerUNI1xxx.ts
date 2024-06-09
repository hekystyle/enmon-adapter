import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '../logger.js';
import { parseTemperature } from './utils/parseTemp.js';
import { ThermometerModel } from '../config/schemas.js';
import { Thermometer } from './thermometer.decorator.js';

@Injectable()
@Thermometer(ThermometerModel.UNI1xxx)
export class ThermometerUNI1xxx {
  constructor(private readonly logger: Logger) {
    this.logger = logger.extend(ThermometerUNI1xxx.name);
  }

  async fetchTemperatures(dataSourceUrl: string): Promise<number[]> {
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

    if (status !== 200) return [];

    const serializedValue = parseTemperature(html);

    this.logger.log({
      msg: 'founded serialized temperature value',
      serialized: serializedValue,
    });

    if (!serializedValue) return [];
    const temperature = parseFloat(serializedValue);

    this.logger.log({
      msg: 'parsed temperature value',
      parsed: temperature,
    });

    return Number.isNaN(temperature) ? [] : [temperature];
  }
}
