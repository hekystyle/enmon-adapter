/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { EnmonEnv } from '../enmon/ApiClient.js';

export const THERMOMETER_MODELS = ['UNI7xxx', 'UNI1xxx'] as const;
export type ThermometerModel = (typeof THERMOMETER_MODELS)[number];

class ConfigEnmon {
  @IsDefined()
  @IsEnum(EnmonEnv)
  readonly env!: EnmonEnv;

  @IsDefined()
  @IsString()
  @IsMongoId()
  readonly customerId!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly devEUI!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly token!: string;
}

export class ConfigThermometer {
  @IsDefined()
  @IsString()
  @IsEnum(THERMOMETER_MODELS)
  readonly model!: ThermometerModel;

  @IsDefined()
  @IsString()
  @IsUrl()
  readonly dataSourceUrl!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigEnmon)
  readonly enmon!: Readonly<ConfigEnmon>;
}

class ConfigWattrouter {
  @IsDefined()
  @IsString()
  @IsUrl()
  readonly baseURL!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigEnmon)
  readonly enmon!: Readonly<ConfigEnmon>;
}

export class Config {
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ConfigThermometer)
  readonly thermometers!: readonly ConfigThermometer[];

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigWattrouter)
  readonly wattrouter!: Readonly<ConfigWattrouter>;
}
