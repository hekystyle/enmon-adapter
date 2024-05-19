import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { configProvider, type Config, ConfigThermometer } from '../config/index.js';
import { AlsValues, Host } from '../als/values-host.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { Thermometer, TemperaturesUploader } from './interfaces.js';
import { THERMOMETERS_TOKEN, TEMPERATURE_UPLOADERS_TOKEN } from './constants.js';
import { AppCronExpression } from '../cron/expression.js';

@Injectable()
export class DirectorService {
  constructor(
    private readonly logger: ContextAwareLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    @Inject(THERMOMETERS_TOKEN)
    private readonly thermometers: Thermometer[],
    @Inject(TEMPERATURE_UPLOADERS_TOKEN)
    private readonly uploaders: TemperaturesUploader[],
  ) {
    logger.setContext(DirectorService.name);
  }

  @Cron(AppCronExpression.EVERY_15_MINUTES)
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
      return;
    }

    const temperatures = await thermometer.getTemperatures(thermometerConfig);

    await this.uploadTemperatures(temperatures, thermometerConfig);
  }

  private async uploadTemperatures(temperatures: number[], config: ConfigThermometer): Promise<void> {
    await Promise.all(
      this.uploaders.map(uploader =>
        uploader
          .upload(temperatures, config)
          .catch((error: unknown) => this.logger.error({ message: 'Temperatures upload filed', config, error })),
      ),
    );
  }
}
