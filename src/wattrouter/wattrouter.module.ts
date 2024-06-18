import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { mxApiClientProvider } from './mx-api-client.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { FETCH_JOB_NAME, VALUES_QUEUE_NAME, type ValuesQueue } from './values.queue.js';
import { WATTrouterMx } from './mx.adapter.js';
import { WATTroutersDiscovery } from './discovery.service.js';
import { WATTrouterValuesProcessor } from './values.processor.js';

@Module({
  imports: [
    DiscoveryModule,
    EnmonModule,
    BullModule.registerQueue({
      prefix: 'WATTrouter',
      name: VALUES_QUEUE_NAME,
    }),
  ],
  providers: [WATTroutersDiscovery, WATTrouterMx, WATTrouterValuesProcessor, mxApiClientProvider],
  exports: [],
})
export class WATTrouterModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(WATTrouterModule.name);

  constructor(
    @InjectQueue(VALUES_QUEUE_NAME)
    private readonly valuesQueue: ValuesQueue,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log(`Adding repeatable ${FETCH_JOB_NAME} job to ${this.valuesQueue.name} queue...`);
    await this.valuesQueue.add(FETCH_JOB_NAME, undefined, {
      repeat: {
        every:
          process.env['NODE_ENV'] === 'development'
            ? 1 * 60 * 1000 // 1 minute
            : 15 * 60 * 1000, // 15 minutes
      },
    });
    this.logger.log(`Added repeatable ${FETCH_JOB_NAME} job to ${this.valuesQueue.name} queue`);
  }
}
