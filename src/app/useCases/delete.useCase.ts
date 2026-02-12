import type { AccountEntity } from "@/domain/entities/account.entity.js";
import { AccountRepository } from "@/app/repositories/account.repository.js";

interface IDeleteDTO {
  ID: string;
}

export class DeleteUseCase {
  public static async delete(dto: IDeleteDTO): Promise<AccountEntity> {
    const account = await AccountRepository.findById(dto.ID);

    if (account === null) {
      throw new Error("Account was not found.");
    }

    await AccountRepository.delete("id", account.id);

    return account;
  }
}
