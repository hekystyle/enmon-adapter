import { Inject, Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import { configProvider, type Config } from '../config/index.js';
import { Logger } from '../logger.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { CronExpression } from '../cron/expression.js';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly registry: SchedulerRegistry,
    private readonly enmonApiClient: EnmonApiClient,
  ) {
    this.logger = logger.extend(TasksService.name);
  }

  onApplicationBootstrap(): void {
    this.logger.log({ msg: 'iterating over thermometers' });
    this.config.thermometers.forEach((thermometerConfig, index) => {
      const jobName = `thermometer-${index}`;
      const jobLogger = this.logger.extend(jobName);

      jobLogger.log({ msg: 'creating cron job' });
      const job = new CronJob(CronExpression.Every15Minutes, () => {
        const tickLogger = jobLogger.extend(randomUUID());
        tickLogger.log({ msg: 'tick' });
        const { model } = thermometerConfig;
        tickLogger.log({ msg: 'handling thermometer', model });
        switch (model) {
          case 'UNI7xxx':
            new ThermometerUNI7xxx(tickLogger, thermometerConfig, this.enmonApiClient)
              .handleTemperature()
              .catch((reason: unknown) => this.logger.error({ reason }));
            break;
          case 'UNI1xxx':
            new ThermometerUNI1xxx(tickLogger, thermometerConfig, this.enmonApiClient)
              .handleTemperature()
              .catch((reason: unknown) => this.logger.error({ reason }));
            break;
          default:
            tickLogger.error({ msg: 'unknown thermometer model', model });
        }
      });

      jobLogger.log({ msg: 'starting cron job' });
      job.start();

      jobLogger.log({ msg: 'registering cron job' });
      this.registry.addCronJob(jobName, job);
    });
  }
}
