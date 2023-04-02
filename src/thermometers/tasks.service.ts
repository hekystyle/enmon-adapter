import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import { Config } from '../config/types.js';
import { Logger } from '../logger.js';
import { EnmonApiClient } from '../services/enmon.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  constructor(
    private readonly logger: Logger,
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
      const job = new CronJob({
        cronTime: CronExpression.EVERY_MINUTE,
        onTick: () => {
          const tickLogger = jobLogger.extend(randomUUID());
          tickLogger.log({ msg: 'tick' });
          const { model } = thermometerConfig;
          switch (model) {
            case 'UNI7xxx':
              tickLogger.log({ msg: 'handling thermometer', model });
              new ThermometerUNI7xxx(tickLogger, thermometerConfig, this.enmonApiClient)
                .handleTemperature()
                .catch(reason => this.logger.error(reason));
              break;
            default:
              tickLogger.error({ msg: 'unknown thermometer model', model });
          }
        },
      });

      jobLogger.log({ msg: 'starting cron job' });
      job.start();

      jobLogger.log({ msg: 'registering cron job' });
      this.registry.addCronJob(jobName, job);
    });
  }
}
