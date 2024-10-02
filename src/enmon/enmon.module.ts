import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from 'agenda-nest';
import { ReadingProcessor } from './reading.processor.js';
import { UPLOAD_READING_MODEL_NAME, UploadReadingSchema } from './upload-reading.schema.js';
import { UploadReadingRepository } from './upload-reading.repository.js';
import { EnmonApiClient } from './ApiClient.js';
import { READINGS_QUEUE_NAME } from './constants.js';

@Module({
  imports: [
    AgendaModule.registerQueue(READINGS_QUEUE_NAME),
    MongooseModule.forFeature([
      {
        name: UPLOAD_READING_MODEL_NAME,
        schema: UploadReadingSchema,
      },
    ]),
  ],
  providers: [
    ReadingProcessor,
    UploadReadingRepository,
    {
      provide: EnmonApiClient,
      useClass: EnmonApiClient,
    },
  ],
  exports: [UploadReadingRepository],
})
export class EnmonModule {}
