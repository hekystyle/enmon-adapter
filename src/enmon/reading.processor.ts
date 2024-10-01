import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { EnmonApiClient } from './ApiClient.js';
import { READINGS_QUEUE_NAME, UPLOAD_JOB_NAME, UploadJobData } from './readings.queue.js';

@Processor(READINGS_QUEUE_NAME)
@Injectable()
export class ReadingProcessor {
  private readonly logger = new Logger(ReadingProcessor.name);

  constructor(private enmonApiClient: EnmonApiClient) {}

  @Process(UPLOAD_JOB_NAME)
  async handleUploadJob(job: Job<unknown>) {
    this.logger.debug({ message: 'processing job...', name: job.name, id: job.id });
    const { reading, config } = UploadJobData.parse(job.data);
    const { env, customerId, devEUI, token } = config;

    const payload = {
      devEUI,
      date: new Date(reading.readAt),
      value: reading.value,
      meterRegister: reading.register,
    } as const;

    this.logger.log({ message: 'uploading reading ...', payload });

    const { status, statusText, data } = await this.enmonApiClient.postMeterPlainValue({
      env,
      customerId,
      token,
      payload,
    });

    this.logger.log({ message: 'upload reading result', payload, status, statusText, data });
  }
}
