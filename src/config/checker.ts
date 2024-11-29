import { Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './schemas.js';

export class ConfigChecker implements OnApplicationBootstrap {
  private readonly logger = new Logger(ConfigChecker.name);

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService<Config, true>,
  ) {}

  onApplicationBootstrap() {
    if (this.config.getOrThrow('version', { infer: true }) !== 'latest') {
      this.logger.warn('used deprecated config, migrate to the latest');
    }
  }
}
