import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Define, Queue } from 'agenda-nest';
import { EnmonApiClient } from './ApiClient.js';
import { UploadReading } from './upload-reading.schema.js';
import { UploadReadingRepository } from './upload-reading.repository.js';
import { READINGS_QUEUE_NAME, UPLOAD_JOB_NAME } from './constants.js';
import { UploadErrorFilter } from './upload-error.filter.js';

@Injectable()
@Queue(READINGS_QUEUE_NAME)
export class ReadingProcessor {
  private readonly logger = new Logger(ReadingProcessor.name);

  constructor(
    @Inject(EnmonApiClient)
    private enmonApiClient: EnmonApiClient,
    @Inject(UploadReadingRepository)
    private uploadDataRepository: UploadReadingRepository,
    @Inject(AsyncLocalStorage)
    private als: AsyncLocalStorage<{ readingId: unknown }>,
    @Inject(UploadErrorFilter)
    private uploadErrorFilter: UploadErrorFilter,
  ) {}

  @Define(UPLOAD_JOB_NAME)
  async handleUploadJob() {
    this.logger.log('processing job...');

    const cursor = this.uploadDataRepository.getSorterCursor();

    // eslint-disable-next-line no-restricted-syntax
    for await (const data of cursor) {
      await this.als.run({ readingId: data._id }, async () => {
        this.logger.log({ message: 'uploading reading...', id: data._id });

        try {
          await this.uploadReading(data);

          // eslint-disable-next-line no-underscore-dangle
          this.logger.log('deleting uploaded reading...');
          await data.deleteOne();
        } catch (e) {
          this.uploadErrorFilter.catch(e);
        }
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
}
