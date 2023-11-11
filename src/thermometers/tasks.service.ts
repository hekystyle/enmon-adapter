import { Inject, Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';
import { configProvider, type Config } from '../config/index.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { AppLogger } from '../logger.js';

const getJobName = (index: number): string => `thermometer-${index}`;

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  constructor(
    @Inject(AppLogger)
    private readonly logger: AppLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly registry: SchedulerRegistry,
    @Inject(AsyncLocalStorage)
    private readonly asyncLocalStorage: AsyncLocalStorage<unknown>,
    private readonly thermometerUNI7xxx: ThermometerUNI7xxx,
    private readonly thermometerUNI1xxx: ThermometerUNI1xxx,
  ) {}

  async onApplicationBootstrap() {
    this.logger.debug('iterating over thermometers');

    this.config.thermometers.forEach((thermometerConfig, index) => {
      this.asyncLocalStorage.run({ model: thermometerConfig.model, index, jobName: getJobName(index) }, () =>
        this.registerAndStartJob(thermometerConfig, index),
      );
    });
  }

  private registerAndStartJob(thermometerConfig: Config['thermometers'][number], index: number) {
    this.logger.debug('creating cron job');

    const job = new CronJob(CronExpression.EVERY_MINUTE, () => {
      this.asyncLocalStorage
        .run({ jobId: randomUUID(), thermometerConfig }, () => this.handleJobTick(thermometerConfig))
        .catch((reason: unknown) => this.logger.error(reason));
    });

    this.logger.log('registering cron job');
    this.registry.addCronJob(getJobName(index), job);

    this.logger.log('starting cron job');
    job.start();
  }

  private async handleJobTick(thermometerConfig: Config['thermometers'][number]) {
    this.logger.debug({ msg: 'onTick' });
    const { model } = thermometerConfig;
    switch (model) {
      case 'UNI7xxx':
        await this.thermometerUNI7xxx.process(thermometerConfig);
        break;
      case 'UNI1xxx':
        await this.thermometerUNI1xxx.process(thermometerConfig);
        break;
      default:
        this.logger.error('unknown thermometer model');
    }
  }
}
