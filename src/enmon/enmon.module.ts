import { DynamicModule, Module } from '@nestjs/common';
import { enmonApiClientProvider } from './enmonApiClient.provider.js';

@Module({
  imports: [],
  providers: [enmonApiClientProvider],
  exports: [enmonApiClientProvider],
})
export class EnmonModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: EnmonModule,
      providers: [enmonApiClientProvider],
      exports: [enmonApiClientProvider],
    };
  }
}
