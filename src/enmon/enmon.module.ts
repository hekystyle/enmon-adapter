import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { READINGS_QUEUE_NAME } from './readings.queue.js';
import { ReadingProcessor } from './reading.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: READINGS_QUEUE_NAME,
      defaultJobOptions: {
        attempts: Number.MAX_SAFE_INTEGER,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
      limiter: {
        max: 1,
        duration: 3 * 1000,
      },
    }),
  ],
  providers: [enmonApiClientProvider, ReadingProcessor],
  exports: [enmonApiClientProvider, BullModule],
})
export class EnmonModule {}
