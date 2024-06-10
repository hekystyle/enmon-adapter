import { Module } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { READINGS_QUEUE_NAME, type ReadingsQueue } from './readings.queue.js';
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
export class EnmonModule {
  constructor(
    @InjectQueue(READINGS_QUEUE_NAME)
    private queue: ReadingsQueue,
  ) {}

  async onApplicationBootstrap() {
    const completedJobs = await this.queue.getCompleted();
    const failedJobs = await this.queue.getFailed();

    completedJobs.concat(failedJobs).forEach(job => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      job.remove();
    });
  }
}
