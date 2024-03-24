import { Cron, CronExpression } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AxiosError } from 'axios';
import { AlsValues, Host } from '../als/values-host.js';
import { RpcService } from './rpc.service.js';
import { type Config } from '../config/schemas.js';
import { configProvider } from '../config/index.js';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { BitcoinConfig } from './config.js';
import { ContextAwareLogger } from '../log/context-aware.logger.js';

@Injectable()
export class BitcoinService {
  constructor(
    @Inject(configProvider.provide)
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<AlsValues>>,
    private readonly rpc: RpcService,
    private readonly enmon: EnmonApiClient,
    private readonly logger: ContextAwareLogger,
  ) {
    logger.setContext(BitcoinService.name);
  }

  // @Cron(CronExpression.Every15Minutes)
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.logger.debug({ method: this.handleCron.name });

    this.config.bitcoin?.forEach(this.processConfig.bind(this));

    if (this.config.bitcoin?.length === 0) {
      this.logger.warn('No bitcoin configurations found');
    }
  }

  private processConfig(config: BitcoinConfig, index: number) {
    this.logger.log(`Processing config ${index}`);

    this.als
      .run(
        new Host<AlsValues>({
          jobId: randomUUID(),
          configId: `bitcoin.${index}`,
        }),
        () => this.sendBlockchainInfoToIntegrations(config),
      )
      .catch(this.handleRejection.bind(this));
  }

  private handleRejection(error: unknown) {
    this.logger.debug({ method: this.handleRejection.name });
    if (error instanceof AxiosError) {
      this.logger.error(error);
    } else {
      this.logger.error({ error });
    }
  }

  private async sendBlockchainInfoToIntegrations(config: BitcoinConfig) {
    this.logger.log('Fetching blockchain info');

    const result = await this.rpc.getBlockchainInfo(config.rpc, {
      id: this.als.getStore()?.ref.jobId,
    });

    if (result.error !== null) {
      this.logger.error({
        message: 'Error fetching blockchain info',
        error: result,
      });
      return;
    }

    this.logger.log('Sending blockchain info to integrations...', result);

    await Promise.all([
      this.enmon.postMeterPlainValue({
        config: config.integrations.enmon,
        payload: {
          date: new Date(),
          devEUI: config.integrations.enmon.devEUI,
          value: result.result.blocks,
          meterRegister: '0-1.0.1',
        },
      }),
      this.enmon.postMeterPlainValue({
        config: config.integrations.enmon,
        payload: {
          date: new Date(),
          devEUI: config.integrations.enmon.devEUI,
          value: result.result.headers,
          meterRegister: '0-1.0.2',
        },
      }),
      this.enmon.postMeterPlainValue({
        config: config.integrations.enmon,
        payload: {
          date: new Date(),
          devEUI: config.integrations.enmon.devEUI,
          value: result.result.verificationprogress * 100,
          meterRegister: '0-1.0.3',
        },
      }),
    ]);

    this.logger.log('Sent blockchain info to integrations');
  }
}
