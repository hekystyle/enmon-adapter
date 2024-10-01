import { Inject, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { EnmonModule } from '../enmon/enmon.module.js';
import { FETCH_JOB_NAME, TEMPERATURES_QUEUE_NAME, type TemperaturesQueue } from './temperatures.queue.js';
import { ThermometersHost } from './thermometers.host.js';
import { TemperaturesProcessor } from './temperatures.processor.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { Config } from '../config/schemas.js';

@Module({
  imports: [
    DiscoveryModule,
    EnmonModule,
    BullModule.registerQueue({
      name: TEMPERATURES_QUEUE_NAME,
    }),
  ],
  providers: [ThermometersHost, TemperaturesProcessor, ThermometerUNI1xxx, ThermometerUNI7xxx],
  exports: [],
})
export class ThermometersModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(ThermometersModule.name);

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService<Config, true>,
    @InjectQueue(TEMPERATURES_QUEUE_NAME)
    private readonly temperaturesQueue: TemperaturesQueue,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.getOrThrow('thermometers', { infer: true }).length === 0) {
      this.logger.warn('No thermometers configured!');
    }

    this.logger.log('Adding repeatable fetch job to temperatures queue...');
    await this.temperaturesQueue.add(FETCH_JOB_NAME, undefined, {
      repeat: {
        every:
          process.env['NODE_ENV'] === 'development'
            ? 1 * 60 * 1000 // 1 minute
            : 15 * 60 * 1000, // 15 minutes
      },
    });
    this.logger.log('Added repeatable fetch job to temperatures queue');
  }
}
