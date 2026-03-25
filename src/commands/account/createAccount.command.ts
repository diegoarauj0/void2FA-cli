import { loggerAccount, loggerDebug, loggerError, loggerSuccess } from "@/core/logger.js";
import { CreateAccountDTO } from "@/dtos/account/createAccount.dto.js";
import { createPrompt } from "@/prompts/account/create.prompt.js";
import { AccountService } from "@/services/account.service.js";
import * as Application from "../aplication.command.js";
import { plainToClass } from "class-transformer";
import { validateSync } from "class-validator";

export class CreateAccountCommand extends Application.ApplicationCommand<CreateAccountDTO> {
  public readonly name = "create";

  public readonly description = "Create a new 2FA account using arguments or interactive prompt.";

  public readonly arguments = [{ name: "name" }, { name: "issuer" }, { name: "secret" }];

  public readonly options: Application.InterfaceApplicationCommandOptions[] = [
    { name: "algorithm", description: "Algorithm: sha1 (default), sha256, sha512", alias: "a", param: "algorithm" },
    { name: "counter", description: "Initial counter for HOTP (default: 0)", alias: "c", param: "counter" },
    { name: "period", description: "TOTP period in seconds (default: 30)", alias: "p", param: "period" },
    { name: "type", description: "Account type: TOTP (default) or HOTP", alias: "t", param: "type" },
    { name: "digits", description: "Number of digits (default: 6)", alias: "d", param: "digits" },
    { name: "encoding", description: "Secret encoding: ascii, hex, base32, base64", alias: "e", param: "encoding" },
  ];

  public readonly examples: Application.InterfaceExamples[] = [
    {
      command: "create @diegoarauj0 Github MRUWKZ3PMFZGC5LKGAQCAIBA",
      comment: "// Create a TOTP account using default settings",
    },
    {
      command: "create --type HOTP --counter 0 Github diegoarauj0 MRUWKZ3PMFZGC5LKGAQCAIBA",
      comment: "// Create a HOTP account with custom counter",
    },
    {
      command: "create",
      comment: "// Open interactive prompt",
    },
  ];

  public readonly DTO = CreateAccountDTO;

  private readonly accountService = new AccountService();

  protected async main(options: CreateAccountDTO): Promise<void> {
    loggerDebug("Create command started", { options });

    const data = options.name ? this.validateInput(options) : await createPrompt();

    if (!data) return;

    loggerDebug("Creating account with data:", data);

    const account = await this.accountService.createAccount(data);

    loggerSuccess("Account created successfully!");
    loggerAccount(account);
  }

  private validateInput(input: CreateAccountDTO): CreateAccountDTO | null {
    const dto = plainToClass(CreateAccountDTO, input);
    const errors = validateSync(dto);

    if (errors.length > 0) {
      loggerError(Object.values(errors[0]?.constraints || {})[0] ?? "Invalid input");
      return null;
    }

    return dto;
  }
}
