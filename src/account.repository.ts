import { dataSource } from "@/database/dataSource.js";
import { AccountEntity } from "./account.entity.js";
import { Like, type DeepPartial } from "typeorm";

export class AccountRepository {
  public accountRepository = dataSource.getRepository(AccountEntity);

  public find(): Promise<AccountEntity[]> {
    return this.accountRepository.find();
  }

  public async delete(accountEntity: AccountEntity): Promise<void> {
    await this.accountRepository.delete({ id: accountEntity.id });
  }

  public create(data: DeepPartial<AccountEntity>): AccountEntity {
    return this.accountRepository.create(data);
  }

  public async save(accountEntity: AccountEntity): Promise<AccountEntity> {
    return this.accountRepository.save(accountEntity);
  }

  public async findOneById(id: string): Promise<AccountEntity | null> {
    return this.accountRepository.findOne({ where: { id } });
  }

  public async search(query: string): Promise<AccountEntity[]> {
    return this.accountRepository.find({
      where: [{ name: Like(`%${query}%`) }, { issuer: Like(`%${query}%`) }, { id: Like(`%${query}%`) }],
    });
  }
}
