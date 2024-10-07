import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AgendaModule, InjectQueue } from 'agenda-nest';
import { Agenda, Job } from 'agenda';
import { ConfigService } from '@nestjs/config';
import { EnmonModule } from '../enmon/enmon.module.js';
import { FETCH_JOB_NAME, TEMPERATURES_QUEUE_NAME } from './constants.js';
import { ThermometersDiscovery } from './discovery.service.js';
import { TemperaturesProcessor } from './temperatures.processor.js';
import { UNI1xxxAdapter } from './uni1xxx.adapter.js';
import { UNI7xxxAdapter } from './uni7xxx.adapter.js';
import { Config } from '../config/schemas.js';

@Module({
  imports: [AgendaModule.registerQueue(TEMPERATURES_QUEUE_NAME), DiscoveryModule, EnmonModule],
  providers: [ThermometersDiscovery, TemperaturesProcessor, UNI1xxxAdapter, UNI7xxxAdapter],
  exports: [],
})
export class ThermometersModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(ThermometersModule.name);

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService<Config, true>,
    @InjectQueue(TEMPERATURES_QUEUE_NAME)
    private queue: Agenda,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.getOrThrow('thermometers', { infer: true }).length === 0) {
      this.logger.warn('No thermometers configured!');
    }

    const interval = this.config.get('DEV', { infer: true }) ? '1 minute' : '15 minutes';
    this.logger.log(`Scheduling ${FETCH_JOB_NAME} job every ${interval}...`);
    const job = (await this.queue.every(interval, FETCH_JOB_NAME)) as Job;
    this.logger.log(`Scheduled, next run at: ${job.attrs.nextRunAt?.toISOString()}`);
  }
}
