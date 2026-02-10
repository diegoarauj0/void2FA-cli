import config from "@/config.js";
import type { AccountEntity } from "@/entities/account.entity.js";
import keytar from "keytar";
import crypto from "node:crypto";

export interface IEncryptedData {
  iv: string;
  content: string;
  tag: string;
}

export class EncryptService {
  public static readonly algorithm = "aes-256-gcm";

  public static async getkey(): Promise<Buffer<ArrayBuffer>> {
    let key = await keytar.getPassword(config.service, "key");

    if (key === null) {
      key = crypto.randomBytes(32).toString("hex");

      await keytar.setPassword(config.service, "key", key);
    }

    return Buffer.from(key!, "hex");
  }

  public static async encrypt(accounts: Array<AccountEntity>): Promise<IEncryptedData> {
    const key = await EncryptService.getkey();

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(EncryptService.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(accounts), "utf8"), cipher.final()]);

    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
      tag: tag.toString("hex"),
    };
  }

  public static async decrypt(data: IEncryptedData): Promise<Array<AccountEntity>> {
    const key = await EncryptService.getkey();
    console.log(data)
    const decipher = crypto.createDecipheriv(EncryptService.algorithm, key, Buffer.from(data.iv, "hex"));

    decipher.setAuthTag(Buffer.from(data.tag, "hex"));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(data.content, "hex")), decipher.final()]);

    return JSON.parse(decrypted.toString("utf8"));
  }
}
