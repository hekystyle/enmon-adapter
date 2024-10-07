import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Adapter } from './adapter.decorator.js';
import { IAdapter, isIAdapter } from './adapter.interface.js';

@Injectable()
export class WATTroutersDiscovery implements OnApplicationBootstrap {
  private map = new Map<string, IAdapter>();

  constructor(
    @Inject(DiscoveryService)
    private discoveryService: DiscoveryService,
  ) {}

  onApplicationBootstrap() {
    this.discoveryService.getProviders({ metadataKey: Adapter.KEY }).forEach(wrapper => {
      const model = this.discoveryService.getMetadataByDecorator(Adapter, wrapper);

      if (!model) {
        throw new Error(`Adapter model not set, provider: ${wrapper.name}`);
      }

      if (this.map.has(model)) {
        throw new Error(`Duplicate adapter model: ${model}`);
      }

      const instance = wrapper.instance as unknown;

      if (!isIAdapter(instance)) {
        throw new Error(`Adapter does not implement interface: ${wrapper.name}`);
      }

      this.map.set(model, instance);
    });
  }

  getByModel(model: string): IAdapter | undefined {
    return this.map.get(model);
  }
}
