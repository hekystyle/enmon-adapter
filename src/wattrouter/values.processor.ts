import { Inject, Injectable, Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Define, Queue } from 'agenda-nest';
import { ConfigService } from '@nestjs/config';
import { Reading } from '../enmon/upload-reading.schema.js';
import { Host } from '../common/host.js';
import { WATTroutersDiscovery } from './discovery.service.js';
import { WATTrouterModel } from './model.js';
import { ConfigWattRouter } from './config.schema.js';
import { UploadReadingRepository } from '../enmon/upload-reading.repository.js';
import { FETCH_JOB_NAME, WATTROUTER_QUEUE_NAME } from './constants.js';
import { Config } from '../config/schemas.js';

@Injectable()
@Queue(WATTROUTER_QUEUE_NAME)
export class WATTrouterValuesProcessor {
  private readonly logger = new Logger(WATTrouterValuesProcessor.name);

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService<Config, true>,
    @Inject(AsyncLocalStorage)
    private readonly als: AsyncLocalStorage<Host<{ configIndex?: number; targetIndex?: number }>>,
    @Inject(WATTroutersDiscovery)
    private readonly adapters: WATTroutersDiscovery,
    @Inject(UploadReadingRepository)
    private readonly uploadJobQueue: UploadReadingRepository,
  ) {}

  @Define(FETCH_JOB_NAME)
  async handleFetchJob() {
    this.logger.log('processing fetch job...');

    const configs = this.config.getOrThrow('wattrouters', { infer: true });

    if (configs.length === 0) {
      this.logger.warn('no WATTrouters configured!');
      return;
    }

    await this.als.run(new Host({}), async () => {
      await Promise.all(
        configs.map((config, index) =>
          this.als.run(new Host({ ...this.als.getStore(), configIndex: index }), () =>
            this.processConfig(config).catch(reason => this.handleConfigProcessingError(reason)),
          ),
        ),
      );
    });

    this.logger.log(`job completed`);
  }

  private async processConfig(config: ConfigWattRouter) {
    this.logger.log(`processing config...`);

    const defaultModel = WATTrouterModel.Mx;

    if (!config.model) {
      this.logger.warn(`model not set in config, falling back to ${defaultModel}`);
    }

    const adapter = this.adapters.getByModel(config.model ?? defaultModel);

    if (!adapter) {
      this.logger.error(`adapter not found by model ${config.model}`);
      return;
    }

    this.logger.log(`fetching values from ${config.baseURL} ...`);

    const { SAH4, SAL4, SAP4, SAS4, VAC } = await adapter.getValues(config.baseURL);

    const readAt = new Date();

    const readings: Reading[] = [
      { readAt, register: `1-1.8.2`, value: SAH4 },
      { readAt, register: `1-1.8.3`, value: SAL4 },
      { readAt, register: `1-1.8.4`, value: SAP4 },
      { readAt, register: `1-2.8.0`, value: SAS4 },
      { readAt, register: `1-32.7.0`, value: VAC },
    ];

    await Promise.all(
      config.targets.map((target, targetIndex) =>
        this.als.run(new Host({ ...this.als.getStore(), targetIndex }), () =>
          this.processTarget(target, readings).catch(reason => this.handleTargetProcessingError(reason)),
        ),
      ),
    );

    this.logger.log('config processed');
  }

  private async processTarget(target: ConfigWattRouter['targets'][number], readings: readonly Reading[]) {
    this.logger.log(`mapping ${readings.length} readings to jobs...`);

    const jobs = readings.map(reading => ({
      reading,
      config: target,
    }));

    this.logger.log(`pushing ${jobs.length} jobs to queue...`);

    await this.uploadJobQueue.addBulk(jobs);

    this.logger.log('jobs pushed to queue');

    await this.uploadJobQueue.scheduleInstantProcessing();

    this.logger.log('target processed');
  }

  private handleTargetProcessingError(error: unknown) {
    this.logger.error(error);
  }

  private handleConfigProcessingError(error: unknown) {
    this.logger.error(error);
  }
}
