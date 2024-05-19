import { SetMetadata } from '@nestjs/common';

export const TEMPERATURES_UPLOADER_KEY = Symbol('TemperaturesUploader');

export const SetTemperaturesUploader = (is = true) => SetMetadata(TEMPERATURES_UPLOADER_KEY, is);
