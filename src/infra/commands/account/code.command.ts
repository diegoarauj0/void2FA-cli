import { AccountRepository } from "@/app/repositories/account.repository.js";
import { BaseCommand } from "../base.command.js";
import { loggerError, loggerSuccess, loggerWarning } from "@/infra/utils/logger.util.js";
import { selectPrompt } from "@/infra/prompts/account/select.prompt.js";
import { OtpService } from "@/app/service/otp.service.js";
import clipboardy from "clipboardy";
import { setTimeout } from "timers/promises";

const emitCode = async (code: string, raw?: boolean, remaining?: number) => {
  if (raw) {
    console.log(code);
    return;
  }

  await clipboardy.write(code);

  if (remaining === undefined) {
    loggerSuccess("Code copied to clipboard");
    return;
  }

  loggerSuccess(`Code copied to clipboard. ${remaining} seconds until the next code`);
};

export const codeCommand = new BaseCommand({
  description: "Copy TOTP/HOTP code to clipboard",
  arguments: ["[id]"],
  name: "code",
  options: [
    { name: "-n, --next", description: "Wait for the TOTP code to reset" },
    { name: "-a, --auto", description: "Auto-increment HOTP counter" },
    { name: "-w, --watch", description: "" },
    { name: "-r, --raw", description: "Print only the generated code" },
  ],
  examples: [
    {
      command: "code 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Generates the TOTP/HOTP code for the account and copies it to the clipboard. (ID)",
    },
    {
      command: "code diegoarauj0",
      comment: "// Generates the TOTP/HOTP code for the account and copies it to the clipboard. (ID)",
    },
    {
      command: "code --next 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Waits for the next TOTP cycle before generating and copying the code",
    },
    {
      command: "code --auto 323e2825-5b92-4bc9-8d3c-57ba2a2a7774",
      comment: "// Generates the HOTP code and automatically increments the counter",
    },
    {
      command: "code",
      comment: "// Opens the interactive prompt when no args are provided",
    },
    {
      command: "code -r diegoarauj0",
      comment: "// Prints only the generated code (for scripts/pipes)",
    },
  ],
  action: async (ID: string, options: any) => {
    const accountID = ID === undefined ? await selectPrompt() : ID;
    const account = await AccountRepository.findById(accountID);

    if (!account) {
      return loggerError("Account not found. Use `find <id>` to verify it, or run `code` without ID to select one.");
    }

    if (account.OTPConfig.type === "HOTP") {
      if (options.auto) {
        account.OTPConfig.counter++;

        await AccountRepository.save(account);

        if (!options.raw) loggerWarning(`Counter updated to: ${account.OTPConfig.counter}`);
      }

      const code = OtpService.generateCode(account);
      return emitCode(code, options.raw);
    }

    let remaining = OtpService.getTotpRemaining(account);

    if (options.watch) {
      while (true) {
        if (!options.raw) loggerWarning(`${remaining} seconds for the next code...`);

        await setTimeout((remaining + 1) * 1000);

        const updated = await AccountRepository.findById(account.id);

        if (!updated) {
          return loggerError("Account changed while waiting. Run `find <id>` to check it, then try `code` again.");
        }

        const code = OtpService.generateCode(account);
        await emitCode(code, options.raw);

        remaining = OtpService.getTotpRemaining(account);
      }
    }

    if (options.next) {
      if (!options.raw) loggerWarning(`Waiting ${remaining} seconds for the next code...`);

      await setTimeout((remaining + 1) * 1000);

      const updated = await AccountRepository.findById(account.id);

      if (!updated) {
        return loggerError("Account changed while waiting. Run `find <id>` to check it, then try `code` again.");
      }
    }

    const code = OtpService.generateCode(account);

    remaining = OtpService.getTotpRemaining(account);

    await emitCode(code, options.raw, remaining);
  },
}).alias("c");
