/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { EnmonEnv } from '../services/enmon.js';

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

class ConfigThermometer {
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
  @ValidateNested()
  @Type(() => ConfigThermometer)
  readonly thermometer!: Readonly<ConfigThermometer>;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigWattrouter)
  readonly wattrouter!: Readonly<ConfigWattrouter>;
}
