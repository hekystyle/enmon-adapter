import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThermometerService } from './thermometer.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { LogModule } from '../log/log.module.js';
import { ThermometersModule } from './thermometers.module.js';
import { TestConfigModule } from '../../tests/config.module.js';

describe('ThermometerService', () => {
  let service: ThermometerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, EnmonModule, LogModule, ThermometersModule, ScheduleModule.forRoot()],
      providers: [],
    }).compile();

    service = module.get<ThermometerService>(ThermometerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
