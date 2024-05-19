import { Module } from '@nestjs/common';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { EnmonTemperaturesUploader } from './temperatures.uploader.js';
import { EnmonWATTRouterUploader } from './wattrouter.uploader.js';

@Module({
  imports: [],
  providers: [enmonApiClientProvider, EnmonTemperaturesUploader, EnmonWATTRouterUploader],
  exports: [enmonApiClientProvider],
})
export class EnmonModule {}
