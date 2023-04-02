import { Test, TestingModule } from '@nestjs/testing';
import { testConfigProvider } from '../../tests/config.provider.js';
import { loggerFactoryProvider } from '../logger.provider.js';
import { WATTrouterService } from './wattrouter.service.js';
import { wattrouterApiClientProvider } from './wattrouterApiClient.provider.js';
import { EnmonModule } from '../enmon/enmon.module.js';

describe('WattrouterService', () => {
  let service: WATTrouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WATTrouterService, testConfigProvider, loggerFactoryProvider, wattrouterApiClientProvider],
      imports: [EnmonModule.forRoot()],
    }).compile();

    service = module.get<WATTrouterService>(WATTrouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
