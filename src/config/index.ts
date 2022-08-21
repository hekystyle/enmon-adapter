import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import configObj from 'config';
import { Config } from './types.js';

const i = plainToInstance(Config, configObj);

validateOrReject(i);

const config: Readonly<Config> = i;

export default config;
