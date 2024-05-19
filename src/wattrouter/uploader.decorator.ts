import { SetMetadata } from '@nestjs/common';

export const WATT_ROUTER_UPLOADER_KEY = Symbol('WATTrouterUploader');

export const IsWATTrouterUploader = (is = true) => SetMetadata(WATT_ROUTER_UPLOADER_KEY, is);
