/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsMongoId, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';
import { EnmonEnv } from '../enmon/ApiClient.js';

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

class ConfigThermometerV1 {
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
  @IsEnum(['UNI7xxx'])
  readonly model!: 'UNI7xxx';
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
  @Type(() => ConfigThermometerV1)
  readonly thermometer!: Readonly<ConfigThermometerV1>;

  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => ConfigThermometer)
  readonly thermometers!: readonly ConfigThermometer[];

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigWattrouter)
  readonly wattrouter!: Readonly<ConfigWattrouter>;
}
