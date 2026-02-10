import type { Encoding } from "@/entities/account.entity.js";

export class AccountService {
  public static detectEncoding(secret: string): Encoding {
    if (secret.replace(/[0-9A-F]/gi, "").length === 0) return "hex";
    if (secret.replace(/[2-7A-Z]/g, "").length === 0) return "base32";
    if (secret.replace(/[0-9a-z+/=]/gi, "").length === 0) return "base64";
    return "ascii";
  }
}
