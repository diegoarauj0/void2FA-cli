import { success } from "../utils/logger.js";
import { BaseCommand } from "./base.command.js";

export class PingCommand extends BaseCommand {
  constructor() {
    super({
      name: "ping",
      description: "return Pong!",
      action: async () => {
        success("Pong!");
      },
    });
  }
}
