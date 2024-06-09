import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Thermometer as IThermometer } from './thermometer.interface.js';
import { Thermometer } from './thermometer.decorator.js';

@Injectable()
export class ThermometersHost {
  private map = new Map<string, IThermometer>();

  constructor(private discoveryService: DiscoveryService) {
    this.discoveryService.getProviders({ metadataKey: Thermometer.KEY }).forEach(wrapper => {
      const model = this.discoveryService.getMetadataByDecorator(Thermometer, wrapper);

      if (!model) {
        throw new Error(`Thermometer model not found: ${wrapper.name}`);
      }

      if (this.map.has(model)) {
        throw new Error(`Duplicate thermometer model: ${model}`);
      }

      const instance = wrapper.instance as IThermometer;
      this.map.set(model, instance);
    });
  }

  getByModel(model: string): IThermometer | undefined {
    return this.map.get(model);
  }
}
