import { Module } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service.js';
import { RpcService } from './rpc.service.js';
import { EnmonModule } from '../enmon/enmon.module.js';

@Module({
  imports: [EnmonModule],
  providers: [BitcoinService, RpcService],
})
export class BitcoinModule {}
