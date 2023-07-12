import axios from 'axios';
import { load } from 'cheerio';
import { type ConfigThermometer } from '../config/index.js';
import { Logger } from '../logger.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';

export class ThermometerUNI7xxx {
  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigThermometer,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    this.logger = logger.extend(ThermometerUNI7xxx.name);
  }

  public async handleTemperature() {
    const temperatures = await this.fetchTemperature();

    await this.uploadTemperatures(temperatures);
  }

  private async fetchTemperature(): Promise<number[]> {
    this.logger.log({ msg: 'fetching temperature meter HTML page' });

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
      if (!serializedValue) throw new Error(`failed to parse temperature value: ${serializedValue as string}`);

      const parsedValue = parseFloat(serializedValue);

      if (Number.isNaN(parsedValue)) throw new Error(`failed to parse temperature value: ${serializedValue}`);

      return parsedValue;
    });
  }

  private async uploadTemperatures(temperatures: number[]): Promise<void> {
    const { env, customerId, devEUI, token } = this.config.enmon;

    await Promise.all(
      temperatures.map(async (temperature, index) => {
        const payload = {
          devEUI,
          date: new Date(),
          value: temperature,
          meterRegister: `20-1.0.${index}`,
        } as const;

        this.logger.log({ msg: 'uploading temperature ...', payload });

        const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
          env,
          customerId,
          token,
          payload,
        });

        this.logger.log({ msg: 'upload temperature result', payload, status, statusText, data });
      }),
    );
  }
}
