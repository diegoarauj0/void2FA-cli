import {
  loggerAccountDebug,
  loggerAccountJSON,
  loggerAccount,
  loggerAccountYAML,
  loggerDebug,
  loggerError,
  loggerWarning,
} from "@/core/logger.js";
import { selectPrompt } from "@/prompts/account/select.prompt.js";
import { AccountService } from "@/services/account.service.js";
import * as Application from "../aplication.command.js";

interface InterfaceSearchAccountsOptions {
  showSecret: boolean;
  query?: string;
  yaml: boolean;
  json: boolean;
}

export class SearchAccountsCommand extends Application.ApplicationCommand<InterfaceSearchAccountsOptions> {
  public readonly name = "search";

  public readonly description = "Search for an account by ID, name, or issuer.";

  public readonly arguments = [{ name: "query" }];

  public readonly options: Application.InterfaceApplicationCommandOptions[] = [
    {
      name: "show-secret",
      description: "Display the account secret and current code (use with caution)",
      alias: "s",
    },
    {
      name: "json",
      description: "Output result in JSON format",
      alias: "j",
    },
    {
      name: "yaml",
      description: "Output result in YAML format",
      alias: "y",
    },
  ];

  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "search 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Search by exact ID",
    },
    {
      command: "search diegoarauj0",
      comment: "// Search by name or custom ID",
    },
    {
      command: "search github",
      comment: "// Search by issuer or partial match",
    },
    {
      command: "search --show-secret github",
      comment: "// Include secret in the output (use with caution)",
    },
    {
      command: "search --json github",
      comment: "// Output result in JSON format",
    },
    {
      command: "search",
      comment: "// Open interactive selection prompt",
    },
  ];

  private readonly accountService = new AccountService();

  protected async main(options: InterfaceSearchAccountsOptions): Promise<void> {
    const { query } = options;
    const showSecret = options.showSecret;

    loggerDebug("Search command started", { query, options });

    const accounts = query ? await this.accountService.search(query) : await this.accountService.find();

    loggerDebug("Accounts found:", accounts.length);

    if (accounts.length === 0) {
      return loggerWarning("No accounts found.");
    }

    const account = accounts.length === 1 ? accounts[0] : await selectPrompt(accounts);

    if (!account) {
      return loggerWarning("No account selected.");
    }

    loggerDebug("Selected account:", account);

    if (options.json && options.yaml) {
      return loggerError("Cannot use --json and --yaml together.");
    }

    if (options.json) {
      return loggerAccountJSON(account, showSecret);
    }

    if (options.yaml) {
      return loggerAccountYAML(account, showSecret);
    }

    loggerAccount(account, showSecret);
  }
}
