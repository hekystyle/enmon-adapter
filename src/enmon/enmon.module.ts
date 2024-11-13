import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from 'agenda-nest';
import { ConfigService } from '@nestjs/config';
import { ReadingProcessor } from './reading.processor.js';
import { UPLOAD_READING_MODEL_NAME, UploadReadingSchema } from './upload-reading.schema.js';
import { UploadReadingRepository } from './upload-reading.repository.js';
import { EnmonApiClient } from './ApiClient.js';
import { READINGS_QUEUE_NAME } from './constants.js';
import { Config } from '../config/schemas.js';
import { UploadErrorFilter } from './upload-error.filter.js';

export interface ModuleOptions {
  contactEmail?: string | undefined;
}

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
    UploadErrorFilter,
    {
      provide: EnmonApiClient,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config, true>) => {
        const options = config.getOrThrow('enmon', { infer: true });
        if (!options.contactEmail) Logger.warn('Contact email not set!', EnmonModule.name);
        return new EnmonApiClient(options.contactEmail);
      },
    },
  ],
  exports: [UploadReadingRepository],
})
export class EnmonModule {}
