import { DiscoveryService } from '@nestjs/core';

type Model = string;

/**
 * Thermometer adapter.
 */
export const Adapter = DiscoveryService.createDecorator<Model>();
