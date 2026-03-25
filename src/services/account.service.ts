import { ACCOUNT_CONSTANT } from "@/account.constant.js";
import { AccountEntity, type EncodingType } from "@/account.entity.js";
import { AccountRepository } from "@/account.repository.js";
import { randomUUID } from "node:crypto";
import { EncryptService } from "./encrypt.service.js";

interface InterfaceCreateAccountProps {
  algorithm?: AccountEntity["algorithm"] | undefined;
  encoding?: AccountEntity["encoding"] | undefined;
  counter?: AccountEntity["counter"] | undefined;
  period?: AccountEntity["period"] | undefined;
  digits?: AccountEntity["digits"] | undefined;
  type?: AccountEntity["type"] | undefined;
  issuer: AccountEntity["issuer"];
  secret: AccountEntity["secret"];
  name: AccountEntity["name"];
}

export class AccountService {
  private readonly accountRepository = new AccountRepository();
  private readonly encryptService = new EncryptService();

  private async decryptAccount(account: AccountEntity): Promise<AccountEntity> {
    account.secret = await this.encryptService.decrypt(account.secret);
    return account;
  }

  private async decryptAccounts(accounts: AccountEntity[]): Promise<AccountEntity[]> {
    return Promise.all(accounts.map((account) => this.decryptAccount(account)));
  }

  public static detectEncoding(secret: string): EncodingType {
    if (secret.replace(/[0-9A-F]/gi, "").length === 0) return "HEX";
    if (secret.replace(/[2-7A-Z]/g, "").length === 0) return "BASE32";
    if (secret.replace(/[0-9a-z+/=]/gi, "").length === 0) return "BASE64";
    return "ASCII";
  }

  public async findOneById(id: string): Promise<AccountEntity | null> {
    const account = await this.accountRepository.findOneById(id);

    if (account === null) return null;

    return this.decryptAccount(account);
  }

  public async find(): Promise<AccountEntity[]> {
    const accounts = await this.accountRepository.find();
    return this.decryptAccounts(accounts);
  }

  public async delete(account: AccountEntity): Promise<void> {
    return this.accountRepository.delete(account);
  }

  public async search(query: string): Promise<AccountEntity[]> {
    const accounts = await this.accountRepository.search(query);
    return this.decryptAccounts(accounts);
  }

  public async save(account: AccountEntity): Promise<AccountEntity> {
    const encryptedSecret = await this.encryptService.encrypt(account.secret);
    account.secret = encryptedSecret;

    const saved = await this.accountRepository.save(account);
    return this.decryptAccount(saved);
  }

  public async updateAccount(account: AccountEntity, data: Partial<Omit<AccountEntity, "id">>): Promise<AccountEntity> {
    const { id: _ignore, ...updates } = data as any;

    account.algorithm = updates.algorithm ?? account.algorithm;
    account.encoding = updates.encoding ?? account.encoding;
    account.counter = updates.counter ?? account.counter;
    account.issuer = updates.issuer ?? account.issuer;
    account.secret = updates.secret ?? account.secret;
    account.period = updates.period ?? account.period;
    account.digits = updates.digits ?? account.digits;
    account.name = updates.name ?? account.name;
    account.type = updates.type ?? account.type;

    return this.save(account);
  }

  public async createAccount(data: InterfaceCreateAccountProps): Promise<AccountEntity> {
    let encoding = data.encoding ? data.encoding : AccountService.detectEncoding(data.secret);

    const account = this.accountRepository.create({
      algorithm: data.algorithm || ACCOUNT_CONSTANT.ALGORITHM_DEFAULT,
      encoding: data.encoding || encoding,
      counter: data.counter || ACCOUNT_CONSTANT.COUNTER_DEFAULT,
      period: data.period || ACCOUNT_CONSTANT.PERIOD_DEFAULT,
      type: data.type || ACCOUNT_CONSTANT.TYPE_DEFAULT,
      digits: data.digits || ACCOUNT_CONSTANT.DIGITS_DEFAULT,
      issuer: data.issuer,
      secret: data.secret,
      id: randomUUID(),
      name: data.name,
    });

    return this.save(account);
  }
}
