import { IsString, Length, IsNotEmpty, IsIn, IsOptional, IsNumber, Min, Max } from "class-validator";
import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import type { AccountEntity } from "@/account.entity.js";
import { Type } from "class-transformer";

export class CreateAccountDTO {
  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.ISSUER_LENGTH_MIN, ACCOUNT_CONSTANT.ISSUER_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public issuer!: AccountEntity["issuer"];

  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.SECRET_LENGTH_MIN, ACCOUNT_CONSTANT.SECRET_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public secret!: AccountEntity["secret"];

  @Type(() => String)
  @Length(ACCOUNT_CONSTANT.NAME_LENGTH_MIN, ACCOUNT_CONSTANT.NAME_LENGTH_MAX)
  @IsNotEmpty()
  @IsString()
  public name!: AccountEntity["name"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.ALGORITHMS)
  @IsOptional()
  @IsString()
  public algorithm?: AccountEntity["algorithm"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.ENCODINGS)
  @IsOptional()
  @IsString()
  public encoding?: AccountEntity["encoding"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.COUNTER_MIN)
  @Max(ACCOUNT_CONSTANT.COUNTER_MAX)
  @IsOptional()
  @IsNumber()
  public counter?: AccountEntity["counter"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.PERIOD_MIN)
  @Max(ACCOUNT_CONSTANT.PERIOD_MAX)
  @IsOptional()
  @IsNumber()
  public period?: AccountEntity["period"];

  @Type(() => Number)
  @Min(ACCOUNT_CONSTANT.DIGITS_MIN)
  @Max(ACCOUNT_CONSTANT.DIGITS_MAX)
  @IsOptional()
  @IsNumber()
  public digits?: AccountEntity["digits"];

  @Type(() => String)
  @IsIn(ACCOUNT_CONSTANT.TYPES)
  @IsOptional()
  @IsString()
  public type?: AccountEntity["type"];
}
