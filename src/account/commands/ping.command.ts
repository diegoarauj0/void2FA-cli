import { loggerSuccess } from "@/core/logger.js";
import { BaseCommand } from "./base.command.js";

export default new BaseCommand({
  name: "ping",
  description: "return Pong!",
  action: async () => {
    loggerSuccess("Pong!");
  },
});
