import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { mxApiClientProvider } from './mx-api-client.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { FETCH_JOB_NAME, VALUES_QUEUE_NAME, type ValuesQueue } from './values.queue.js';
import { WATTrouterMx } from './mx.adapter.js';
import { WATTroutersDiscovery } from './discovery.service.js';
import { WATTrouterValuesProcessor } from './values.processor.js';
import { Config } from '../config/schemas.js';

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
    @Inject(ConfigService)
    private readonly config: ConfigService<Config, true>,
    @InjectQueue(VALUES_QUEUE_NAME)
    private readonly valuesQueue: ValuesQueue,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get('wattrouters', { infer: true }).length === 0) {
      this.logger.warn('No thermometers configured!');
    }

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
