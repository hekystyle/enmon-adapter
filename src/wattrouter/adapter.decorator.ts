import { SetMetadata } from '@nestjs/common';

export const WATT_ROUTER_ADAPTER_KEY = Symbol('WATTrouterAdapter');

export const IsWATTrouterAdapter = (is = true) => SetMetadata(WATT_ROUTER_ADAPTER_KEY, is);
