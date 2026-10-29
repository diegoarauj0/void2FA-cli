import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import type { Account, EncodingType } from "@/account.interface.js";
import { StorageService } from "./storage.service.js";
import { randomUUID } from "node:crypto";

interface InterfaceCreateAccountProps {
  algorithm?: Account["algorithm"] | undefined;
  encoding?: Account["encoding"] | undefined;
  counter?: Account["counter"] | undefined;
  period?: Account["period"] | undefined;
  digits?: Account["digits"] | undefined;
  type?: Account["type"] | undefined;
  issuer: Account["issuer"];
  secret: Account["secret"];
  name: Account["name"];
}

export class AccountService {
  private readonly storageService = new StorageService();

  public static detectEncoding(secret: string): EncodingType {
    if (secret.replace(/[0-9A-F]/gi, "").length === 0) return "HEX";
    if (secret.replace(/[2-7A-Z]/g, "").length === 0) return "BASE32";
    if (secret.replace(/[0-9a-z+/=]/gi, "").length === 0) return "BASE64";
    return "ASCII";
  }

  public async findOneById(id: string): Promise<Account | null> {
    return this.storageService.findOneById(id);
  }

  public async find(): Promise<Account[]> {
    return this.storageService.find();
  }

  public async delete(account: Account): Promise<void> {
    return this.storageService.delete(account.id);
  }

  public async search(query: string): Promise<Account[]> {
    return this.storageService.search(query);
  }

  public async save(account: Account): Promise<Account> {
    return this.storageService.save(account);
  }

  public async updateAccount(account: Account, data: Partial<Omit<Account, "id">>): Promise<Account> {
    const updated: Account = {
      ...account,
      algorithm: data.algorithm ?? account.algorithm,
      encoding: data.encoding ?? account.encoding,
      counter: data.counter ?? account.counter,
      issuer: data.issuer ?? account.issuer,
      secret: data.secret ?? account.secret,
      period: data.period ?? account.period,
      digits: data.digits ?? account.digits,
      name: data.name ?? account.name,
      type: data.type ?? account.type,
    };

    return this.save(updated);
  }

  public async createAccount(data: InterfaceCreateAccountProps): Promise<Account> {
    const encoding = data.encoding ? data.encoding : AccountService.detectEncoding(data.secret);

    const account: Account = {
      id: randomUUID(),
      algorithm: data.algorithm ?? ACCOUNT_CONSTANT.ALGORITHM_DEFAULT,
      encoding: data.encoding ?? encoding,
      counter: data.counter ?? ACCOUNT_CONSTANT.COUNTER_DEFAULT,
      period: data.period ?? ACCOUNT_CONSTANT.PERIOD_DEFAULT,
      type: data.type ?? ACCOUNT_CONSTANT.TYPE_DEFAULT,
      digits: data.digits ?? ACCOUNT_CONSTANT.DIGITS_DEFAULT,
      issuer: data.issuer,
      secret: data.secret,
      name: data.name,
    };

    return this.save(account);
  }
}
