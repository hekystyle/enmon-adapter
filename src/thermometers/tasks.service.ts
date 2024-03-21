import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { configProvider, type Config, ConfigThermometer } from '../config/index.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { AlsValues, Host } from '../als/values-host.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly logger: ContextAwareLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    private readonly thermometerUNI7xxx: ThermometerUNI7xxx,
    private readonly thermometerUNI1xxx: ThermometerUNI1xxx,
  ) {
    logger.setContext(TasksService.name);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron(): void {
    this.logger.log({ msg: 'iterating over thermometers' });

    this.config.thermometers.forEach(this.processConfig.bind(this));
  }

  private processConfig(thermometerConfig: ConfigThermometer, index: number) {
    const jobName = `thermometer-${index}`;

    this.als
      .run(
        new Host({
          jobId: jobName,
        }),
        () => this.sendTemperatureToEnmon(thermometerConfig),
      )
      .catch(reason => this.handleRejection(reason));
  }

  private handleRejection(error: unknown) {
    this.logger.debug({ method: this.handleRejection.name });

    this.logger.error({ error });
  }

  private async sendTemperatureToEnmon(thermometerConfig: ConfigThermometer): Promise<void> {
    const { model } = thermometerConfig;
    this.logger.log({ msg: 'selecting thermometer processing strategy', model });

    const strategy = this.selectThermometerStrategy(model);

    await strategy?.handleTemperature(thermometerConfig);
  }

  private selectThermometerStrategy(model: ConfigThermometer['model']) {
    switch (model) {
      case 'UNI7xxx':
        return this.thermometerUNI7xxx;
      case 'UNI1xxx':
        return this.thermometerUNI1xxx;
      default: {
        this.logger.error({ msg: 'unknown thermometer model', model });
        return undefined;
      }
    }
  }
}
