import { DynamicModule, FactoryProvider, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from 'agenda-nest';
import { ReadingProcessor } from './reading.processor.js';
import { UPLOAD_READING_MODEL_NAME, UploadReadingSchema } from './upload-reading.schema.js';
import { UploadReadingRepository } from './upload-reading.repository.js';
import { EnmonApiClient } from './ApiClient.js';
import { READINGS_QUEUE_NAME } from './constants.js';

export interface ModuleOptions {
  contactEmail?: string | undefined;
}

const OPTIONS_TOKEN = Symbol('enmon/options');

export class EnmonModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnmonModule.name);

  constructor(
    @Inject(OPTIONS_TOKEN)
    private readonly opts: ModuleOptions,
  ) {}

  static forRootAsync(options: Pick<FactoryProvider<ModuleOptions>, 'inject' | 'useFactory'>): DynamicModule {
    return {
      module: EnmonModule,
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
        {
          provide: OPTIONS_TOKEN,
          inject: options.inject,
          useFactory: options.useFactory,
        } as FactoryProvider<ModuleOptions>,
        ReadingProcessor,
        UploadReadingRepository,
        {
          provide: EnmonApiClient,
          inject: [OPTIONS_TOKEN],
          useFactory: (opts: ModuleOptions) => new EnmonApiClient(opts.contactEmail),
        },
      ],
      exports: [UploadReadingRepository],
    };
  }

  onApplicationBootstrap() {
    if (!this.opts.contactEmail) {
      this.logger.warn('Contact email not provided!');
    }
  }
}
