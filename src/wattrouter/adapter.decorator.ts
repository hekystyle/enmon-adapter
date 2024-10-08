import { DiscoveryService } from '@nestjs/core';

type Model = string;

/**
 * WATTrouter adapter.
 */
export const Adapter = DiscoveryService.createDecorator<Model>();
