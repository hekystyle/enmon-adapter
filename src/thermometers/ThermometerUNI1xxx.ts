import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { parseTemperature } from './utils/parseTemp.js';
import type { ConfigThermometer } from '../config/index.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { Thermometer } from './interfaces.js';

@Injectable()
export class ThermometerUNI1xxx implements Thermometer {
  readonly model = 'UNI1xxx';

  constructor(private readonly logger: ContextAwareLogger) {
    logger.setContext(ThermometerUNI1xxx.name);
  }

  async getTemperatures(config: ConfigThermometer): Promise<number[]> {
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
