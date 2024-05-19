import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { configProvider, type Config, ConfigThermometer } from '../config/index.js';
import { AlsValues, Host } from '../als/values-host.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { Thermometer } from './interfaces.js';
import { THERMOMETERS_TOKEN } from './constants.js';
import { CronExpression } from '../cron/expression.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly logger: ContextAwareLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    @Inject(THERMOMETERS_TOKEN)
    private readonly thermometers: Thermometer[],
  ) {
    logger.setContext(TasksService.name);
  }

  @Cron(CronExpression.Every15Minutes)
  handleCron(): void {
    this.logger.log({ message: 'iterating over thermometers' });

    this.config.thermometers.forEach(this.processConfig.bind(this));
  }

  private processConfig(thermometerConfig: ConfigThermometer, index: number) {
    this.als
      .run(
        new Host<AlsValues>({
          jobId: randomUUID(),
          configId: `thermometer.${index}`,
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
    this.logger.log({ message: 'selecting thermometer processing strategy', model });

    const thermometer = this.thermometers.find(t => t.model === model);

    if (!thermometer) {
      this.logger.error({ message: 'thermometer not found', model });
    }

    await thermometer?.handleTemperature(thermometerConfig);
  }
}
