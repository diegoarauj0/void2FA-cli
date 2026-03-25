import { loggerAccount, loggerDebug, loggerError, loggerInfo, loggerSuccess, loggerWarning } from "@/core/logger.js";
import { selectPrompt } from "@/prompts/account/select.prompt.js";
import { AccountService } from "@/services/account.service.js";
import * as Application from "../aplication.command.js";
import type { AccountEntity } from "@/account.entity.js";
import { confirmPrompt } from "@/prompts/account/confirm.prompt.js";

export class DeleteAccountCommand extends Application.ApplicationCommand<{ query?: string }> {
  public readonly name = "delete";

  public readonly description = "Delete an account by ID, name, or interactive selection.";

  public readonly arguments = [{ name: "query" }];

  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "delete 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Delete an account by ID",
    },
    {
      command: "delete diegoarauj0",
      comment: "// Delete an account by name",
    },
    {
      command: "delete",
      comment: "// Select an account interactively",
    },
  ];

  private readonly accountService = new AccountService();

  protected async main(options: { query?: string }): Promise<void> {
    loggerDebug("Delete command started", { options });

    const query = options.query;
    const accounts = query ? await this.accountService.search(query) : await this.accountService.find();

    loggerDebug("Accounts found:", accounts.length);

    if (accounts.length === 0) {
      return loggerWarning("No accounts found.");
    }

    let account = accounts.length === 1 ? accounts[0] : await selectPrompt(accounts);

    if (!account) {
      return loggerError("Account not found.");
    }

    loggerDebug("Selected account for deletion:", account);

    const confirmed = await confirmPrompt(
      "Delete",
      `Are you sure you want to delete "${account.name}" (${account.issuer})?`,
    );

    if (!confirmed) {
      return loggerInfo("Operation cancelled.");
    }

    await this.accountService.delete(account);

    loggerSuccess("Account deleted successfully!");
    loggerAccount(account);
  }

  private async resolveAccount(id?: string): Promise<AccountEntity | null> {
    if (!id) {
      const accounts = await this.accountService.find();

      if (accounts.length === 0) {
        loggerWarning("No accounts available to delete.");
        return null;
      }

      return selectPrompt(accounts);
    }

    return this.accountService.findOneById(id);
  }
}
