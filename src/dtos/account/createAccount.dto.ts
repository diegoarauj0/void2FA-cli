import { IsString, Length, IsNotEmpty, IsIn, IsOptional, IsNumber, Min, Max } from "class-validator";
import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import type { Account } from "@/account.interface.js";
import { Type } from "class-transformer";

export class CreateAccountDTO {
  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.ISSUER_LENGTH_MIN, ACCOUNT_CONSTANT.ISSUER_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public issuer!: Account["issuer"];

  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.SECRET_LENGTH_MIN, ACCOUNT_CONSTANT.SECRET_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public secret!: Account["secret"];

  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.NAME_LENGTH_MIN, ACCOUNT_CONSTANT.NAME_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public name!: Account["name"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.ALGORITHMS)
  @IsOptional()
  @IsString()
  public algorithm?: Account["algorithm"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.ENCODINGS)
  @IsOptional()
  @IsString()
  public encoding?: Account["encoding"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.COUNTER_MIN)
  @Max(ACCOUNT_CONSTANT.COUNTER_MAX)
  @IsOptional()
  @IsNumber()
  public counter?: Account["counter"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.PERIOD_MIN)
  @Max(ACCOUNT_CONSTANT.PERIOD_MAX)
  @IsOptional()
  @IsNumber()
  public period?: Account["period"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.DIGITS_MIN)
  @Max(ACCOUNT_CONSTANT.DIGITS_MAX)
  @IsOptional()
  @IsNumber()
  public digits?: Account["digits"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.TYPES)
  @IsOptional()
  @IsString()
  public type?: Account["type"];
}
