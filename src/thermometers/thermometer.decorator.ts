import { DiscoveryService } from '@nestjs/core';

type Model = string;

export const Thermometer = DiscoveryService.createDecorator<Model>();
