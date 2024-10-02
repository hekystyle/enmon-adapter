import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { IAdapter, isIAdapter } from './adapter.interface.js';
import { Adapter } from './adapter.decorator.js';

@Injectable()
export class ThermometersDiscovery {
  private map = new Map<string, IAdapter>();

  constructor(private discoveryService: DiscoveryService) {
    this.discoveryService.getProviders({ metadataKey: Adapter.KEY }).forEach(wrapper => {
      const model = this.discoveryService.getMetadataByDecorator(Adapter, wrapper);

      if (!model) {
        throw new Error(`Thermometer model not found: ${wrapper.name}`);
      }

      if (this.map.has(model)) {
        throw new Error(`Duplicate thermometer model: ${model}`);
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
