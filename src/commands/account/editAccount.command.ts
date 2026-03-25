import { loggerAccount, loggerDebug, loggerError, loggerSuccess, loggerWarning } from "@/core/logger.js";
import { EditAccountDTO } from "@/dtos/account/editAccount.dto.js";
import { selectPrompt } from "@/prompts/account/select.prompt.js";
import { AccountService } from "@/services/account.service.js";
import { editPrompt } from "@/prompts/account/edit.prompt.js";
import type { AccountEntity } from "@/account.entity.js";
import * as Application from "../aplication.command.js";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";

interface InterfaceEditAccountOptions {
  query?: string | undefined;
  name?: string | undefined;
  issuer?: string | undefined;
  secret?: string | undefined;
  algorithm?: string | undefined;
  encoding?: string | undefined;
  period?: string | undefined;
  digits?: string | undefined;
  counter?: string | undefined;
  type?: string | undefined;
}

export class EditAccountCommand extends Application.ApplicationCommand<InterfaceEditAccountOptions> {
  public readonly name = "edit";

  public readonly description = "Edit an existing account by ID, name, or interactive selection.";

  public readonly arguments = [{ name: "query" }];

  public readonly options: Application.InterfaceApplicationCommandOptions[] = [
    { name: "name", description: "Account name", alias: "n", param: "name" },
    { name: "issuer", description: "Issuer (service/provider)", alias: "i", param: "issuer" },
    { name: "secret", description: "Secret key (use with caution)", alias: "s", param: "secret" },
    { name: "algorithm", description: "Algorithm: SHA1, SHA256, SHA512", alias: "a", param: "algorithm" },
    { name: "encoding", description: "Encoding: ASCII, HEX, BASE32, BASE64", alias: "e", param: "encoding" },
    { name: "digits", description: "Token length (digits)", alias: "d", param: "digits" },
    { name: "period", description: "TOTP period in seconds", alias: "p", param: "period" },
    { name: "counter", description: "Counter value (for HOTP)", alias: "c", param: "counter" },
    { name: "type", description: "Account type: TOTP or HOTP", alias: "t", param: "type" },
  ];

  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "edit diegoarauj0",
      comment: "// Open interactive editor for selected account",
    },
    {
      command: "edit -n negativo diegoarauj0",
      comment: "// Update account name",
    },
    {
      command: "edit -i Gitlab -t HOTP 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Update issuer and type using ID",
    },
    {
      command: "edit",
      comment: "// Select account interactively, then edit",
    },
  ];

  private readonly accountService = new AccountService();

  protected async main(options: InterfaceEditAccountOptions): Promise<void> {
    loggerDebug("Edit command started", { options });

    const query = options.query;
    const accounts = query ? await this.accountService.search(query) : await this.accountService.find();

    loggerDebug("Accounts found:", accounts.length);

    if (accounts.length === 0) {
      return loggerWarning("No accounts found.");
    }

    let account = accounts.length === 1 ? accounts[0] : await selectPrompt(accounts);

    if (!account) {
      return loggerError("Account was not found.");
    }

    loggerDebug("Selected account:", account);

    const { query: _ignore, ...input } = options;

    const data = Object.keys(input).length === 0 ? await editPrompt(account) : this.validateInput(input);

    if (!data) return;

    loggerDebug("Update payload:", data);

    const updatedAccount = await this.accountService.updateAccount(account, data);

    loggerSuccess("Account updated successfully!");
    loggerAccount(updatedAccount);
  }

  private async resolveAccount(id?: string): Promise<AccountEntity | null> {
    if (!id) {
      const accounts = await this.accountService.find();

      if (accounts.length === 0) {
        loggerWarning("No accounts available to edit.");
        return null;
      }

      return selectPrompt(accounts);
    }

    return this.accountService.findOneById(id);
  }

  private validateInput(input: any): Partial<AccountEntity> | null {
    const dto = plainToClass(EditAccountDTO, input);
    const errors = validateSync(dto, { skipMissingProperties: true });

    if (errors.length > 0) {
      loggerError(Object.values(errors[0]?.constraints || {})[0] ?? "Invalid value");
      return null;
    }

    return dto;
  }
}
