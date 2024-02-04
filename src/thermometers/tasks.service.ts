import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import { configProvider, type Config, ConfigThermometer } from '../config/index.js';
import { ThermometerWorkerFactory } from './worker-factory.js';

@Injectable()
export class ThermometersTasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ThermometersTasksService.name);

  constructor(
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly registry: SchedulerRegistry,
    private readonly workerFactory: ThermometerWorkerFactory,
  ) {}

  onApplicationBootstrap(): void {
    this.logger.log({ msg: 'iterating over thermometers' });
    this.config.thermometers.forEach(this.registerCronJob.bind(this));
  }

  private registerCronJob(thermometerConfig: ConfigThermometer, index: number) {
    const jobName = `thermometer-${index}`;
    const jobLogger = new Logger(`${ThermometersTasksService.name}:${jobName}`);

    jobLogger.log({ msg: 'creating cron job' });
    const job = new CronJob(CronExpression.EVERY_MINUTE, () => {
      const tickId = randomUUID();

      const tickLogger = new Logger(`${ThermometersTasksService.name}:${tickId}`);
      tickLogger.log({ msg: 'tick' });

      this.workerFactory
        .create(thermometerConfig, tickId)
        .handleTemperature()
        .catch((reason: unknown) => this.logger.error({ reason }));
    });

    jobLogger.log({ msg: 'starting cron job' });
    job.start();

    jobLogger.log({ msg: 'registering cron job' });
    this.registry.addCronJob(jobName, job);
  }
}
