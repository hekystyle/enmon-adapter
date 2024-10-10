import { Inject, Injectable } from '@nestjs/common';
import { Define, Queue } from 'agenda-nest';
import { AxiosError } from 'axios';
import { EnmonApiClient } from './ApiClient.js';
import { UploadReading } from './upload-reading.schema.js';
import { UploadReadingRepository } from './upload-reading.repository.js';
import { READINGS_QUEUE_NAME, UPLOAD_JOB_NAME } from './constants.js';
import { AppLogger } from '../logging/logger.js';

@Injectable()
@Queue(READINGS_QUEUE_NAME)
export class ReadingProcessor {
  constructor(
    @Inject(AppLogger)
    private logger: AppLogger,
    @Inject(EnmonApiClient)
    private enmonApiClient: EnmonApiClient,
    @Inject(UploadReadingRepository)
    private uploadDataRepository: UploadReadingRepository,
  ) {
    logger.setContext(ReadingProcessor.name);
  }

  @Define(UPLOAD_JOB_NAME)
  async handleUploadJob() {
    this.logger.log('processing job...');

    const cursor = this.uploadDataRepository.getSorterCursor();

    // eslint-disable-next-line no-restricted-syntax
    for await (const data of cursor) {
      await this.logger.beginScope({ readingId: data._id }, async () => {
        this.logger.log('uploading reading...');
        await this.uploadReading(data).catch(reason => this.handleUploadReadingError(reason));

        // eslint-disable-next-line no-underscore-dangle
        this.logger.log('deleting uploaded reading...');
        await data.deleteOne();
      });
    }

    this.logger.log('all readings uploaded');
  }

  private async uploadReading({ config, reading }: UploadReading) {
    const { env, customerId, devEUI, token } = config;

    const payload = {
      devEUI,
      date: reading.readAt,
      value: reading.value,
      meterRegister: reading.register,
    } as const;

    this.logger.log({ message: 'uploading reading ...', payload });

    const { status, statusText } = await this.enmonApiClient.postMeterPlainValue({
      env,
      customerId,
      token,
      payload,
    });

    this.logger.log({ message: 'reading uploaded', status, statusText });
  }

  private handleUploadReadingError(e: unknown) {
    if (e instanceof AxiosError) {
      const { status, statusText } = e.response ?? {};
      this.logger.log({ message: 'upload reading failed', status, statusText, data: e.response?.data as unknown });
    } else {
      throw e;
    }
  }
}
