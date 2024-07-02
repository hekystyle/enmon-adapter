import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Adapter } from './adapter.decorator.js';
import { WATTrouter, isWATTrouter } from './adapter.interface.js';

@Injectable()
export class WATTroutersDiscovery implements OnApplicationBootstrap {
  private map = new Map<string, WATTrouter>();

  constructor(private discoveryService: DiscoveryService) {}

  onApplicationBootstrap() {
    this.discoveryService.getProviders({ metadataKey: Adapter.KEY }).forEach(wrapper => {
      const model = this.discoveryService.getMetadataByDecorator(Adapter, wrapper);

      if (!model) {
        throw new Error(`Adapter model not set, provider: ${wrapper.name}`);
      }

      if (this.map.has(model)) {
        throw new Error(`Duplicate adapter model: ${model}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- false positive
      const { instance }: { instance: unknown } = wrapper;

      if (!isWATTrouter(instance)) {
        throw new Error(`Adapter does not implement interface: ${wrapper.name}`);
      }

      this.map.set(model, instance);
    });
  }

  getByModel(model: string): WATTrouter | undefined {
    return this.map.get(model);
  }
}
