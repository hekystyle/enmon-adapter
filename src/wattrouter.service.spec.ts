import { Test, TestingModule } from '@nestjs/testing';
import { testConfigProvider } from '../tests/config.provider.js';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { loggerFactoryProvider } from './logger.provider.js';
import { WATTrouterService } from './wattrouter.service.js';

describe('WattrouterService', () => {
  let service: WATTrouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WATTrouterService, testConfigProvider, loggerFactoryProvider, enmonApiClientProvider],
    }).compile();

    service = module.get<WATTrouterService>(WATTrouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
