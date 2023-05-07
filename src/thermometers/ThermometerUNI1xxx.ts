import axios from 'axios';
import { Logger } from '../logger.js';
import { parseTemperature } from './utils/parseTemp.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import type { ConfigThermometer } from '../config/types.js';

export class ThermometerUNI1xxx {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigThermometer,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    this.logger = logger.extend(ThermometerUNI1xxx.name);
  }

  public async handleTemperature() {
    this.logger.log(this.handleTemperature.name);

    const temperature = await this.fetchTemperature();

    if (temperature) await this.uploadTemperature(temperature);
  }

  private async fetchTemperature(): Promise<undefined | number> {
    const {
      status,
      statusText,
      data: html,
    } = await axios.get<string>(this.config.dataSourceUrl, {
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

  private async uploadTemperature(temperature: number): Promise<void> {
    const { env, customerId, devEUI, token } = this.config.enmon;

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
