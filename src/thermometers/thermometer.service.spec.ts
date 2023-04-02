import { Test, TestingModule } from '@nestjs/testing';
import { testConfigProvider } from '../../tests/config.provider.js';
import { enmonApiClientProvider } from '../enmonApiClient.provider.js';
import { loggerFactoryProvider } from '../logger.provider.js';
import { ThermometerService } from './thermometer.service.js';

describe('ThermometerService', () => {
  let service: ThermometerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThermometerService, testConfigProvider, loggerFactoryProvider, enmonApiClientProvider],
    }).compile();

    service = module.get<ThermometerService>(ThermometerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
