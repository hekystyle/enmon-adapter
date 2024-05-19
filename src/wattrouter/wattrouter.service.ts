import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { configProvider, type Config, ConfigWattrouter } from '../config/index.js';
import { AppCronExpression } from '../cron/expression.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';
import { AlsValues, Host } from '../als/values-host.js';
import { WATTRouterUploadersHost } from './uploaders.host.js';
import { WATTrouterAdaptersHost } from './adapters.host.js';

@Injectable()
export class WATTrouterService {
  constructor(
    private readonly logger: ContextAwareLogger,
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    private readonly adapters: WATTrouterAdaptersHost,
    private readonly uploadersHost: WATTRouterUploadersHost,
  ) {
    logger.setContext(WATTrouterService.name);
  }

  @Cron(AppCronExpression.EVERY_15_MINUTES)
  public handleCron() {
    this.logger.debug({ method: this.handleCron.name });

    [this.config.wattrouter].forEach(this.processConfig.bind(this));
  }

  private processConfig(config: ConfigWattrouter, index: number) {
    this.als
      .run(
        new Host<AlsValues>({
          jobId: randomUUID(),
          configId: `wattrouter.${index}`,
        }),
        () => this.sendValuesToIntegrations(config),
      )
      .catch(this.handleRejection.bind(this));
  }

  private handleRejection(error: unknown) {
    this.logger.debug({ method: this.handleRejection.name });

    if (axios.isAxiosError<unknown>(error)) {
      const { statusText, status } = error.response ?? {};
      this.logger.error({
        error,
        status,
        statusText,
        data: error.response?.data,
      });
    } else {
      this.logger.error({ error });
    }
  }

  private async sendValuesToIntegrations(config: ConfigWattrouter) {
    this.logger.debug(this.sendValuesToIntegrations.name);

    const selectedAdapter = this.adapters.ref.find(adapter => adapter.model === config.model);

    if (!selectedAdapter) {
      this.logger.error({ message: 'Adapter not found', model: config.model });
      return;
    }

    this.logger.log('fetching WATTrouter stats & measurements...');
    const values = await selectedAdapter.getValues(config);

    await Promise.all(
      this.uploadersHost.ref.map(uploader =>
        uploader.upload(values, config).catch(reason => this.handleRejection(reason)),
      ),
    );

    this.logger.log('WATTrouter values uploaded');
  }
}
