import { Module } from '@nestjs/common';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';
import { EnmonTemperaturesUploader } from './temperatures.uploader.js';

@Module({
  imports: [],
  providers: [enmonApiClientProvider, EnmonTemperaturesUploader],
  exports: [enmonApiClientProvider],
})
export class EnmonModule {}
