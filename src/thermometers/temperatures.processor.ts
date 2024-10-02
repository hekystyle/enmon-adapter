import { Injectable, Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Define, Queue } from 'agenda-nest';
import { ConfigService } from '@nestjs/config';
import type { Config } from '../config/schemas.js';
import { ThermometersDiscovery } from './discovery.service.js';
import { Host } from '../common/host.js';
import { UploadReadingRepository } from '../enmon/upload-reading.repository.js';
import { FETCH_JOB_NAME, TEMPERATURES_QUEUE_NAME } from './constants.js';
import { ConfigThermometer } from './config.schema.js';

@Injectable()
@Queue(TEMPERATURES_QUEUE_NAME)
export class TemperaturesProcessor {
  private readonly logger = new Logger(TemperaturesProcessor.name);

  constructor(
    private readonly config: ConfigService<Config, true>,
    private readonly als: AsyncLocalStorage<Host<{ configIndex: number }>>,
    private readonly thermometers: ThermometersDiscovery,
    private readonly uploadDataRepository: UploadReadingRepository,
  ) {}

  @Define(FETCH_JOB_NAME)
  async handleFetchJob() {
    this.logger.log('processing fetch job...');

    const thermometers = this.config.get('thermometers', { infer: true });

    if (thermometers.length === 0) {
      this.logger.warn('no thermometers configured!');
      return;
    }

    await Promise.all(
      thermometers.map((thermometer, index) =>
        this.als.run(new Host({ configIndex: index }), () =>
          this.processThermometerConfig(thermometer).catch(reason => this.handleConfigProcessingError(reason)),
        ),
      ),
    );

    this.logger.log('fetch job completed');
  }

  private async processThermometerConfig(config: ConfigThermometer) {
    this.logger.log(`processing thermometer config...`);

    const thermometer = this.thermometers.getByModel(config.model);

    if (!thermometer) {
      this.logger.error(`Thermometer not found by model ${config.model}`);
      return;
    }

    const temperatures = await thermometer.getTemperatures(config.dataSourceUrl);

    const readAt = new Date();

    const readings = temperatures.map((temp, index) => ({
      register: `20-1.0.${index}`,
      value: temp,
      readAt,
    }));

    this.logger.log(`pushing ${readings.length} readings to queue...`);
    const jobs = readings.map(reading => ({
      reading,
      config: config.enmon,
    }));

    await this.uploadDataRepository.addBulk(jobs);

    this.logger.log('readings pushed to queue');

    await this.uploadDataRepository.scheduleInstantProcessing();

    this.logger.log('thermometer config processed');
  }

  private handleConfigProcessingError(error: unknown) {
    this.logger.error(error);
  }
}
