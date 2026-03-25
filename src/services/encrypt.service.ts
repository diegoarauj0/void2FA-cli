import { Config } from "@/config.js";
import crypto from "node:crypto";
import keytar from "keytar";

export class EncryptService {
  public readonly algorithm = "aes-256-gcm";
  private readonly prefix = "ENC$";
  private readonly ivLength = 12;
  private readonly authTagLength = 16;

  public async getkey(): Promise<Buffer> {
    let key = await keytar.getPassword(Config.SERVICE, "key");

    if (key === null) {
      key = crypto.randomBytes(32).toString("hex");

      await keytar.setPassword(Config.SERVICE, "key", key);
    }

    return Buffer.from(key!, "hex");
  }

  public async encrypt(value: string): Promise<string> {
    const key = await this.getkey();
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv, { authTagLength: this.authTagLength });

    const encryptedContent = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, authTag, encryptedContent]).toString("base64");
    return `${this.prefix}${payload}`;
  }

  public async decrypt(value: string): Promise<string> {
    if (!value.startsWith(this.prefix)) return value;

    try {
      const key = await this.getkey();
      const data = Buffer.from(value.slice(this.prefix.length), "base64");

      if (data.length < this.ivLength + this.authTagLength) return value;

      const iv = data.subarray(0, this.ivLength);
      const authTag = data.subarray(this.ivLength, this.ivLength + this.authTagLength);
      const encryptedContent = data.subarray(this.ivLength + this.authTagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv, { authTagLength: this.authTagLength });
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
      return decrypted.toString("utf8");
    } catch {
      return value;
    }
  }
}
