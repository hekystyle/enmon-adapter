import { Inject } from '@nestjs/common';
import { configProvider } from './index.js';

export const InjectConfig = () => Inject(configProvider.provide);
