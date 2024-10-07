import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AgendaModule, InjectQueue } from 'agenda-nest';
import { Agenda, Job } from 'agenda';
import { ConfigService } from '@nestjs/config';
import { mxApiClientProvider } from './mx-api-client.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { WATTrouterMx } from './mx.adapter.js';
import { WATTroutersDiscovery } from './discovery.service.js';
import { WATTrouterValuesProcessor } from './values.processor.js';
import { FETCH_JOB_NAME, WATTROUTER_QUEUE_NAME } from './constants.js';
import { Config } from '../config/schemas.js';

@Module({
  imports: [AgendaModule.registerQueue(WATTROUTER_QUEUE_NAME), DiscoveryModule, EnmonModule],
  providers: [WATTroutersDiscovery, WATTrouterMx, WATTrouterValuesProcessor, mxApiClientProvider],
  exports: [],
})
export class WATTrouterModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(WATTrouterModule.name);

  constructor(
    @Inject(ConfigService)
    private config: ConfigService<Config, true>,
    @InjectQueue(WATTROUTER_QUEUE_NAME)
    private queue: Agenda,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.getOrThrow('thermometers', { infer: true }).length === 0) {
      this.logger.warn('No WATTrouters configured!');
    }

    const interval = this.config.get('DEV', { infer: true }) ? '1 minute' : '15 minutes';
    this.logger.log(`Scheduling ${FETCH_JOB_NAME} job every ${interval}...`);
    const job = (await this.queue.every(interval, FETCH_JOB_NAME)) as Job;
    this.logger.log(`Scheduled, next run at: ${job.attrs.nextRunAt?.toISOString()}`);
  }
}
