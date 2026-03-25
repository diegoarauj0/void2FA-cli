import { ApplicationCommand } from "./aplication.command.js";
import { loggerSuccess } from "@/core/logger.js";
import { Config } from "@/config.js";

export class PingCommand extends ApplicationCommand {
  public readonly description: string = "return Pong!";
  public readonly name: string = "ping";

  protected async main(): Promise<void> {
    loggerSuccess(`version ${Config.VERSION}`);
    loggerSuccess(`isDev ${Config.IS_DEV ? "yes" : "no"}`);
    loggerSuccess("Pong!");
  }
}
