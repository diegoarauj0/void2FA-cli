import { accountDefaults } from "@/app/constants/accountDefaults.js";
import { AccountEntity, type Algorithm, type Encoding } from "@/domain/entities/account.entity.js";
import { AccountRepository } from "@/app/repositories/account.repository.js";
import { AccountService } from "@/app/service/account.service.js";
import crypto from "node:crypto";

export interface ICreateDTO {
  name: string;
  issuer: string;
  secret: string;
  algorithm?: Algorithm | undefined;
  encoding?: Encoding | undefined;
  counter?: number | undefined;
  period?: number | undefined;
  digits?: number | undefined;
  type?: "TOTP" | "HOTP";
  customID?: string | undefined;
}

export class CreateUseCase {
  private static buildAccount(dto: ICreateDTO): AccountEntity {
    const type = dto.type || accountDefaults.type;
    const algorithm = (dto.algorithm?.toUpperCase() || accountDefaults.algorithm) as Algorithm;

    return AccountEntity.create({
      id: crypto.randomUUID(),
      name: dto.name,
      issuer: dto.issuer,
      secret: dto.secret,
      algorithm,
      encoding: dto.encoding || AccountService.detectEncoding(dto.secret),
      digits: dto.digits || accountDefaults.digits,
      customID: dto.customID?.trim(),
      OTPConfig: {
        type,
        counter: type === "HOTP" ? dto.counter || accountDefaults.counter : (undefined as never),
        period: type === "TOTP" ? dto.period || accountDefaults.period : (undefined as never),
      },
    });
  }

  public static async create(dto: ICreateDTO): Promise<AccountEntity> {
    const account = this.buildAccount(dto);
    await AccountRepository.save(account);
    return account;
  }
}
