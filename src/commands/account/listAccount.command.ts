import { loggerAccountTable, loggerDebug, loggerWarning } from "@/core/logger.js";
import { AccountService } from "@/services/account.service.js";
import * as Application from "../aplication.command.js";

export class ListAccountsCommand extends Application.ApplicationCommand<{ showSecret: boolean }> {
  public readonly name = "list";

  public readonly description = "List all saved accounts.";

  public readonly options: Application.InterfaceApplicationCommandOptions[] = [
    {
      name: "show-secret",
      description: "Display each account's secret and current code (use with caution)",
      alias: "s",
    },
  ];

  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "list",
      comment: "// Display all saved accounts",
    },
    {
      command: "list --show-secret",
      comment: "// Display all accounts including secrets and codes (use with caution)",
    },
  ];

  private readonly accountService = new AccountService();

  protected async main(options: { showSecret: boolean }): Promise<void> {
    loggerDebug("List command started", { options });

    const showSecret = options.showSecret
    const accounts = await this.accountService.find();

    loggerDebug("Accounts found:", accounts.length);

    if (accounts.length === 0) {
      return loggerWarning("No accounts found.");
    }

    loggerAccountTable(accounts, showSecret);
  }
}
