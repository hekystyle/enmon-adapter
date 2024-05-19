import { DiscoveryService, Reflector } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { WATTrouterAdapter } from './adapter.interfaces.js';
import { WATT_ROUTER_ADAPTER_KEY } from './adapter.decorator.js';

@Injectable()
export class WATTrouterAdaptersHost {
  public readonly ref: readonly WATTrouterAdapter[];

  constructor(discovery: DiscoveryService, reflector: Reflector) {
    const services = discovery
      .getProviders()
      .filter(provider => {
        if (!provider.metatype) return false;
        const metadata = reflector.get<boolean | undefined>(WATT_ROUTER_ADAPTER_KEY, provider.metatype);
        return metadata === true;
      })
      .map(provider => provider.instance as WATTrouterAdapter);

    if (services.length === 0) {
      Logger.warn('No adapters found', WATTrouterAdaptersHost.name);
    } else {
      Logger.log(`Found ${services.length} adapters`, WATTrouterAdaptersHost.name);
    }

    this.ref = services;
  }
}
