import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { FETCH_JOB_NAME, TEMPERATURES_QUEUE_NAME } from './temperatures.queue.js';
import type { Config, ConfigThermometer } from '../config/schemas.js';
import { InjectConfig } from '../config/inject-config.decorator.js';
import { READINGS_QUEUE_NAME, type ReadingsQueue } from '../enmon/readings.queue.js';
import { ThermometersHost } from './thermometers.host.js';
import { Host } from '../als/host.js';

@Processor(TEMPERATURES_QUEUE_NAME)
export class TemperaturesProcessor {
  private readonly logger = new Logger(TemperaturesProcessor.name);

  constructor(
    @InjectConfig()
    private readonly config: Config,
    private readonly als: AsyncLocalStorage<Host<{ configIndex: number }>>,
    private readonly thermometers: ThermometersHost,
    @InjectQueue(READINGS_QUEUE_NAME)
    private readonly readingsQueue: ReadingsQueue,
  ) {}

  @Process(FETCH_JOB_NAME)
  async handleFetchJob() {
    this.logger.log('Handling temperatures fetch job...');
    await Promise.all(
      this.config.thermometers.map((thermometer, index) =>
        this.als.run(new Host({ configIndex: index }), () =>
          this.processThermometerConfig(thermometer).catch(reason => this.handleConfigProcessingError(reason)),
        ),
      ),
    );
  }

  private async processThermometerConfig(config: ConfigThermometer) {
    this.logger.log({ msg: `Processing thermometer config` });

    const thermometer = this.thermometers.getByModel(config.model);

    if (!thermometer) {
      this.logger.error(`Thermometer not found by model ${config.model}`);
      return;
    }

    const temperatures = await thermometer.fetchTemperatures(config.dataSourceUrl);

    const readAt = new Date();

    const readings = temperatures.map((temp, index) => ({
      register: `20-1.0.${index}`,
      value: temp,
      readAt: readAt.toISOString(),
    }));

    this.logger.log({ msg: `pushing ${readings.length} readings to queue...` });
    const jobs = readings.map(reading => ({
      data: {
        reading,
        config: config.enmon,
      },
    }));
    await this.readingsQueue.addBulk(jobs);
    this.logger.log({ msg: 'readings pushed to queue' });
  }

  private handleConfigProcessingError(error: unknown) {
    this.logger.error('An error occurred while processing a thermometer config', error);
  }
}
