import type { AccountEntity } from "@/account/account.entity.js";
import speakeasy from "speakeasy";

export class OtpService {
  public static getTotpRemaining(account: AccountEntity): number {
    if (account.OTPConfig.type === "TOTP") {
      return account.OTPConfig.period - (Math.floor(Date.now() / 1000) % account.OTPConfig.period);
    }

    throw new Error("Account must be of the TOTP type.");
  }

  public static generateCode(account: AccountEntity): string {
    if (account.OTPConfig.type === "HOTP") {
      return speakeasy.hotp({
        secret: account.secret,
        encoding: account.encoding,
        digits: account.digits,
        algorithm: account.algorithm.toLowerCase() as any,
        counter: account.OTPConfig.counter,
      });
    }

    return speakeasy.totp({
      secret: account.secret,
      encoding: account.encoding,
      digits: account.digits,
      algorithm: account.algorithm.toLowerCase() as any,
      step: account.OTPConfig.period,
    });
  }
}
