import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Paths } from 'type-fest';
import { InjectQueue } from 'agenda-nest';
import { Agenda } from 'agenda';
import { UPLOAD_READING_MODEL_NAME, UploadReading } from './upload-reading.schema.js';
import { READINGS_QUEUE_NAME, UPLOAD_JOB_NAME } from './constants.js';

@Injectable()
export class UploadReadingRepository {
  private readonly logger = new Logger(UploadReadingRepository.name);

  constructor(
    @InjectModel(UPLOAD_READING_MODEL_NAME)
    private uploadReadingModel: Model<UploadReading>,
    @InjectQueue(READINGS_QUEUE_NAME)
    private queue: Agenda,
  ) {}

  async addBulk(items: readonly UploadReading[]) {
    return await this.uploadReadingModel.create(items);
  }

  getSorterCursor() {
    return this.uploadReadingModel
      .find()
      .sort({ ['reading.readAt' satisfies Paths<UploadReading>]: 'asc' })
      .cursor();
  }

  async scheduleInstantProcessing() {
    this.logger.log(`scheduling instant upload job processing...`);
    await this.queue.now(UPLOAD_JOB_NAME, {});
  }
}
