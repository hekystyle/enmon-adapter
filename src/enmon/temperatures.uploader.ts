import { Injectable } from '@nestjs/common';
import { ConfigThermometer } from '../config/schemas.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { TemperaturesUploader } from '../thermometers/interfaces.js';
import { EnmonApiClient } from './ApiClient.js';
import { SetTemperaturesUploader } from '../thermometers/uploader.decorator.js';
import { INTEGRATION_ID } from './constants.js';

@Injectable()
@SetTemperaturesUploader()
export class EnmonTemperaturesUploader implements TemperaturesUploader {
  readonly integrationId = INTEGRATION_ID;

  constructor(
    private readonly logger: ContextAwareLogger,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    this.logger.setContext(EnmonTemperaturesUploader.name);
  }

  async upload(temperatures: number[], config: ConfigThermometer): Promise<void> {
    await Promise.all(
      temperatures.map(async (temperature, index) => {
        const payload = {
          devEUI: config.enmon.devEUI,
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
