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

/**
 * @deprecated This option is legacy and will be removed in future. Use `thermometers` with `UNI1xxx` model instead.
 */
export class ConfigThermometerV1 {
  @IsDefined()
  @IsString()
  @IsUrl()
  readonly dataSourceUrl!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigEnmon)
  readonly enmon!: Readonly<ConfigEnmon>;
}

export class ConfigThermometer extends ConfigThermometerV1 {
  @IsDefined()
  @IsString()
  @IsEnum(THERMOMETER_MODELS)
  readonly model!: ThermometerModel;
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
  /**
   * @deprecated This option is legacy and will be removed in future. Use `thermometers` with `UNI1xxx` model instead.
   */
  @ValidateNested()
  @Type(() => ConfigThermometerV1)
  readonly thermometer?: Readonly<ConfigThermometerV1>;

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ConfigThermometer)
  readonly thermometers!: readonly ConfigThermometer[];

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigWattrouter)
  readonly wattrouter!: Readonly<ConfigWattrouter>;
}
