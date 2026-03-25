import { loggerDebug, loggerError, loggerInfo, loggerSuccess, loggerWarning } from "@/core/logger.js";
import { selectPrompt } from "@/prompts/account/select.prompt.js";
import { AccountService } from "@/services/account.service.js";
import type { AccountEntity } from "@/account.entity.js";
import * as Application from "../aplication.command.js";
import { OtpService } from "@/services/otp.service.js";
import { setTimeout } from "timers/promises";
import clipboardy from "clipboardy";

interface InterfaceCodeOptions {
  clipboard?: boolean;
  watch?: boolean;
  next?: boolean;
  auto?: boolean;
  raw?: boolean;
  query?: string;
}

export class CodeAccountCommand extends Application.ApplicationCommand<InterfaceCodeOptions> {
  public readonly name = "code";
  public readonly description = "Copy an account's current TOTP/HOTP code to the clipboard";
  public readonly arguments = [{ name: "query" }];
  public readonly options: Application.InterfaceApplicationCommandOptions[] = [
    { name: "next", description: "Wait for the next TOTP cycle before generating", alias: "n" },
    { name: "no-auto", description: "Do not auto-increment the HOTP counter", alias: "a" },
    { name: "watch", description: "Continuously emit new TOTP codes", alias: "w" },
    { name: "raw", description: "Print only the generated code", alias: "r" },
    { name: "no-clipboard", description: "Do not copy the code automatically.", alias: "c" },
  ];
  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "code 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Copy the current code for the given account",
    },
    {
      command: "code --watch diegoarauj0",
      comment: "// Keep copying each new TOTP code",
    },
    {
      command: "code --next diegoarauj0",
      comment: "// Wait until the next cycle before copying",
    },
    {
      command: "code -r diegoarauj0",
      comment: "// Print only the code (useful for scripts)",
    },
  ];

  private readonly accountService = new AccountService();

  protected async main(options: InterfaceCodeOptions): Promise<void> {
    loggerDebug("Code command started", { options });

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

    loggerDebug("Selected account:", account);

    const raw = options.raw;
    const noClipboard = options.clipboard;

    if (options.watch && options.next) {
      return loggerError("Cannot use --watch and --next together.");
    }

    if (account.type === "HOTP") {
      if (options.watch) {
        return loggerWarning("Watch mode is not supported for HOTP accounts.");
      }

      if (options.auto) {
        account.counter += 1;
        account = await this.accountService.save(account);

        loggerDebug("HOTP counter updated:", account.counter);

        if (!raw) {
          loggerWarning(`Counter updated to ${account.counter}`);
        }
      }

      const code = OtpService.generateCode(account);

      loggerDebug("Generated HOTP code");

      await this.emitCode(code, noClipboard, raw);
      return;
    }

    let remaining = OtpService.getTotpRemaining(account);

    if (options.watch) {
      loggerInfo("Watching for new codes... Press Ctrl+C to stop.");

      while (true) {
        if (!raw) {
          loggerWarning(`${remaining}s until next code...`);
        }

        let remainingTime = remaining;

        const IntervalId = setInterval(() => {
          process.stdout.write("\x1b[1A");
          process.stdout.write("\x1b[2K");

          loggerWarning(`${remainingTime}s until next code...`);

          remainingTime--;
        }, 1000);

        await setTimeout((remaining + 1) * 1000);

        clearInterval(IntervalId);

        try {
          account = await this.ensureAccountStillExists(account);
        } catch (error) {
          return loggerError((error as Error).message);
        }

        const code = OtpService.generateCode(account);

        loggerDebug("Generated TOTP code (watch)");

        await this.emitCode(code, noClipboard, raw);

        remaining = OtpService.getTotpRemaining(account);
      }
    }

    if (options.next) {
      if (!raw) {
        loggerWarning(`Waiting ${remaining}s for next code...`);
      }

      await setTimeout((remaining + 1) * 1000);

      try {
        account = await this.ensureAccountStillExists(account);
      } catch (error) {
        return loggerError((error as Error).message);
      }
    }

    const code = OtpService.generateCode(account);
    remaining = OtpService.getTotpRemaining(account);

    loggerDebug("Generated TOTP code");

    await this.emitCode(code, noClipboard, raw, remaining);
  }

  private async emitCode(code: string, clipboard?: boolean, raw?: boolean, remaining?: number) {
    if (raw) return console.log(code);

    if (clipboard) await clipboardy.write(code);

    loggerInfo(`Code: ${code}`);

    if (!clipboard) return;

    if (remaining === undefined) return loggerSuccess("Code copied to clipboard.");

    loggerSuccess(`Code copied to clipboard (${remaining}s remaining)`);
  }

  private async ensureAccountStillExists(account: AccountEntity): Promise<AccountEntity> {
    const refreshed = await this.accountService.findOneById(account.id);

    if (refreshed === null) {
      throw new Error("Account changed while waiting. Run `search <id>` to check it, then try `code` again.");
    }

    return refreshed;
  }
}
