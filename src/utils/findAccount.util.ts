import type { AccountEntity } from "@/entities/account.entity.js";
import { accountRepository } from "@/repositories/account.repository.js";

export default async function (id: string): Promise<AccountEntity | null> {
  return (await accountRepository.find("id", id)) || (await accountRepository.find("customID", id));
}
