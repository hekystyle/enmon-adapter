import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import type { Job, JobId } from 'bull';
import { READINGS_QUEUE_NAME, Reading, UPLOAD_JOB_NAME, type ReadingsQueue } from '../enmon/readings.queue.js';
import { Host } from '../common/host.js';
import { FETCH_JOB_NAME, VALUES_QUEUE_NAME } from './values.queue.js';
import { WATTroutersDiscovery } from './discovery.service.js';
import { WATTrouterModel } from './model.js';
import { ConfigHost } from '../config/host.js';
import { ConfigWattRouter } from './config.schema.js';

@Processor(VALUES_QUEUE_NAME)
export class WATTrouterValuesProcessor {
  private readonly logger = new Logger(WATTrouterValuesProcessor.name);

  constructor(
    private readonly configHost: ConfigHost,
    private readonly als: AsyncLocalStorage<Host<{ jobId?: JobId; configIndex?: number; targetIndex?: number }>>,
    private readonly adapters: WATTroutersDiscovery,
    @InjectQueue(READINGS_QUEUE_NAME)
    private readonly readingsQueue: ReadingsQueue,
  ) {}

  @Process(FETCH_JOB_NAME)
  async handleFetchJob(job: Job<unknown>) {
    const configs = this.configHost.ref.wattrouters;

    if (configs.length === 0) {
      this.logger.warn('no wattrouters configured');
      return;
    }

    await this.als.run(new Host({ jobId: job.id }), async () => {
      this.logger.log({ msg: `handling job...` });

      await Promise.all(
        configs.map((config, index) =>
          this.als.run(new Host({ ...this.als.getStore(), configIndex: index }), () =>
            this.processConfig(config).catch(reason => this.handleConfigProcessingError(reason)),
          ),
        ),
      );
      this.logger.log({ msg: `job processed` });
    });
  }

  private async processConfig(config: ConfigWattRouter) {
    this.logger.log({ msg: `processing config...` });

    const defaultModel = WATTrouterModel.Mx;

    if (!config.model) {
      this.logger.warn(`model not set in config, falling back to ${defaultModel}`);
    }

    const adapter = this.adapters.getByModel(config.model ?? defaultModel);

    if (!adapter) {
      this.logger.error(`adapter not found by model ${config.model}`);
      return;
    }

    this.logger.log({ msg: `fetching values from ${config.baseURL}...` });

    const { SAH4, SAL4, SAP4, SAS4, VAC } = await adapter.fetchValues(config.baseURL);

    const readAt = new Date().toISOString();

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

    this.logger.log({ msg: 'config processed' });
  }

  private async processTarget(target: ConfigWattRouter['targets'][number], readings: readonly Reading[]) {
    this.logger.log({ msg: `mapping ${readings.length} readings to jobs...` });

    const jobs = readings.map(reading => ({
      name: UPLOAD_JOB_NAME,
      data: {
        reading,
        config: target,
      },
    }));

    this.logger.log({ msg: `pushing ${jobs.length} jobs to queue...` });

    await this.readingsQueue.addBulk(jobs);

    this.logger.log({ msg: 'jobs pushed to queue' });
  }

  private handleTargetProcessingError(error: unknown) {
    this.logger.error('error occurred while processing a target', error);
  }

  private handleConfigProcessingError(error: unknown) {
    this.logger.error('error occurred while processing a config', error);
  }
}
