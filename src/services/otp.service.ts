import type { AccountEntity } from "@/account.entity.js";
import speakeasy from "speakeasy";

export class OtpService {
  private static normalizeAlgorithm(account: Pick<AccountEntity, "algorithm">) {
    return account.algorithm.toLowerCase() as "sha1" | "sha256" | "sha512";
  }

  private static normalizeEncoding(account: Pick<AccountEntity, "encoding">) {
    return account.encoding.toLowerCase() as "ascii" | "hex" | "base32" | "base64";
  }

  public static getTotpRemaining(account: AccountEntity): number {
    if (account.type !== "TOTP") {
      throw new Error("Account must be of the TOTP type.");
    }

    const seconds = Math.floor(Date.now() / 1000) % account.period;

    return account.period - seconds;
  }

  public static generateCode(account: AccountEntity): string {
    const algorithm = this.normalizeAlgorithm(account);
    const encoding = this.normalizeEncoding(account);

    if (account.type === "HOTP") {
      return speakeasy.hotp({
        secret: account.secret,
        encoding,
        digits: account.digits,
        algorithm,
        counter: account.counter,
      });
    }

    return speakeasy.totp({
      secret: account.secret,
      encoding,
      digits: account.digits,
      algorithm,
      step: account.period,
    });
  }
}
