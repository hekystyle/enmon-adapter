import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Inject, Injectable } from '@nestjs/common';
import { EnmonApiClient } from './ApiClient.js';
import { READINGS_QUEUE_NAME, UPLOAD_JOB_NAME, UploadJobData } from './readings.queue.js';
import { Logger } from '../logger.js';

@Processor(READINGS_QUEUE_NAME)
@Injectable()
export class ReadingProcessor {
  constructor(
    @Inject(Logger)
    private logger: Logger,
    private enmonApiClient: EnmonApiClient,
  ) {
    this.logger = this.logger.extend(ReadingProcessor.name);
  }

  @Process(UPLOAD_JOB_NAME)
  async handleUploadJob(job: Job<unknown>) {
    this.logger.debug({ msg: 'processing job...', name: job.name, id: job.id });
    const { reading, config } = UploadJobData.parse(job.data);
    const { env, customerId, devEUI, token } = config;

    const payload = {
      devEUI,
      date: new Date(reading.readAt),
      value: reading.value,
      meterRegister: reading.register,
    } as const;

    this.logger.log({ msg: 'uploading reading ...', payload });

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      env,
      customerId,
      token,
      payload,
    });

    this.logger.log({ msg: 'upload reading result', payload, status, statusText, data });
  }
}
