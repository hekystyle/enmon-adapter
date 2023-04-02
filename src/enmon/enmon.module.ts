import { Module } from '@nestjs/common';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';

@Module({
  imports: [],
  providers: [enmonApiClientProvider],
  exports: [enmonApiClientProvider],
})
export class EnmonModule {}
