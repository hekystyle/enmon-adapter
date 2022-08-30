/* eslint-disable max-classes-per-file */
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsNumber, IsDefined, ValidateNested } from 'class-validator';

export class AllTimeStats {
  /** Counted from this date in format YYYY-MM-DD */
  @IsDefined()
  @IsDateString()
  SAD!: string;

  /** Surplus on Phase L1 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAS1!: number;

  /** Consumption in high tariff on Phase L1 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAH1!: number;

  /** Consumption in low tariff on Phase L1 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAL1!: number;

  /** Production on Phase L1 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAP1!: number;

  /** Surplus on Phase L2 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAS2!: number;

  /** Consumption in high tariff on Phase L2 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAH2!: number;

  /** Consumption in low tariff on Phase L2 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAL2!: number;

  /** Production on Phase L2 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAP2!: number;

  /** Surplus on Phase L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAS3!: number;

  /** Consumption in high tariff on Phase L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAH3!: number;

  /** Consumption in low tariff on Phase L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAL3!: number;

  /** Production on Phase L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAP3!: number;

  /** Surplus on Phase L1+L2+L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAS4!: number;

  /** Consumption in high tariff on Phase L1+L2+L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAH4!: number;

  /** Consumption in low tariff on Phase L1+L2+L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAL4!: number;

  /** Production on Phase L1+L2+L3 in kWh */
  @Transform(({ value }) => parseFloat(value))
  @IsDefined()
  @IsNumber()
  SAP4!: number;
}

export class AllTimeStatsShape {
  @Type(() => AllTimeStats)
  @ValidateNested()
  @IsDefined()
  // eslint-disable-next-line camelcase
  stat_alltime!: AllTimeStats;
}
