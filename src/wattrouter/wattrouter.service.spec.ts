import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WATTrouterService } from './wattrouter.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';
import { WATTrouterModule } from './wattrouter.module.js';
import { LogModule } from '../log/log.module.js';
import { TestConfigModule } from '../../tests/config.module.js';

describe('WattrouterService', () => {
  let service: WATTrouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, EnmonModule, WATTrouterModule, LogModule],
      providers: [],
    }).compile();

    service = module.get<WATTrouterService>(WATTrouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
