import { DiscoveryService } from '@nestjs/core';

type Model = string;

export const Adapter = DiscoveryService.createDecorator<Model>();
