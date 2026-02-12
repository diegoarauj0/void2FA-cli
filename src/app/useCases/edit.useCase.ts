import { accountDefaults } from "@/app/constants/accountDefaults.js";
import { AccountEntity, type Algorithm, type Encoding } from "@/domain/entities/account.entity.js";
import { AccountRepository } from "@/app/repositories/account.repository.js";
import { AccountService } from "@/app/service/account.service.js";

type AccountType = "TOTP" | "HOTP";

export interface IEditDTO {
  id: string;
  name?: string | undefined;
  issuer?: string | undefined;
  secret?: string | undefined;
  algorithm?: Algorithm | undefined;
  encoding?: Encoding | undefined;
  counter?: number | undefined;
  period?: number | undefined;
  digits?: number | undefined;
  type?: AccountType | undefined;
  customID?: string | undefined;
}

export class EditUseCase {
  public static async edit(dto: IEditDTO): Promise<AccountEntity> {
    const currentAccount = await AccountRepository.findById(dto.id);

    if (currentAccount === null) {
      throw new Error("Account was not found.");
    }

    const type = dto.type ?? currentAccount.OTPConfig.type;
    const secret = dto.secret ?? currentAccount.secret;
    const algorithm = (dto.algorithm?.toUpperCase() as Algorithm | undefined) ?? currentAccount.algorithm;
    const customID = dto.customID === undefined ? currentAccount.customID : dto.customID.trim() || undefined;

    const account = AccountEntity.create({
      id: currentAccount.id,
      name: dto.name ?? currentAccount.name,
      issuer: dto.issuer ?? currentAccount.issuer,
      secret,
      algorithm,
      encoding:
        dto.encoding ?? (dto.secret !== undefined ? AccountService.detectEncoding(secret) : currentAccount.encoding),
      digits: dto.digits ?? currentAccount.digits,
      customID,
      OTPConfig:
        type === "TOTP"
          ? {
              type: "TOTP",
              period:
                dto.period ??
                (currentAccount.OTPConfig.type === "TOTP" ? currentAccount.OTPConfig.period : accountDefaults.period),
            }
          : {
              type: "HOTP",
              counter:
                dto.counter ??
                (currentAccount.OTPConfig.type === "HOTP" ? currentAccount.OTPConfig.counter : accountDefaults.counter),
            },
    });

    await AccountRepository.save(account);

    return account;
  }
}
