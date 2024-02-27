import { Injectable } from '@nestjs/common';
import { EnmonApiClient } from '../enmon/ApiClient.js';
import { ThermometerUNI1xxx } from './ThermometerUNI1xxx.js';
import { ThermometerUNI7xxx } from './ThermometerUNI7xxx.js';
import { ConfigThermometer, ThermometerModel } from '../config/schemas.js';

const MAP = {
  UNI7xxx: ThermometerUNI7xxx,
  UNI1xxx: ThermometerUNI1xxx,
} as const satisfies Record<ThermometerModel, typeof ThermometerUNI1xxx | typeof ThermometerUNI7xxx>;

@Injectable()
export class ThermometerWorkerFactory {
  constructor(private readonly enmonApiClient: EnmonApiClient) {}

  create(config: ConfigThermometer, workerId: string): ThermometerUNI1xxx | ThermometerUNI7xxx {
    const Worker = MAP[config.model];

    return new Worker(workerId, config, this.enmonApiClient);
  }
}
