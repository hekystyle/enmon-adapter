import { DiscoveryService, Reflector } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { WATTrouterUploader } from './uploader.interface.js';
import { WATT_ROUTER_UPLOADER_KEY } from './uploader.decorator.js';

@Injectable()
export class WATTRouterUploadersHost {
  public readonly ref: readonly WATTrouterUploader[];

  constructor(discovery: DiscoveryService, reflector: Reflector) {
    const services = discovery
      .getProviders()
      .filter(provider => {
        if (!provider.metatype) return false;
        const metadata = reflector.get<boolean | undefined>(WATT_ROUTER_UPLOADER_KEY, provider.metatype);
        return metadata === true;
      })
      .map(provider => provider.instance as WATTrouterUploader);

    if (services.length === 0) {
      Logger.warn('No uploaders found', WATTRouterUploadersHost.name);
    } else {
      Logger.log(`Found ${services.length} uploaders`, WATTRouterUploadersHost.name);
    }

    this.ref = services;
  }
}
