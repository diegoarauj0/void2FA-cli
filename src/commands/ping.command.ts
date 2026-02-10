import { loggerSuccess } from "@/utils/logger.util.js";
import { BaseCommand } from "./base.command.js";

export default new BaseCommand({
  name: "ping",
  description: "return Pong!",
  action: async () => {
    loggerSuccess("Pong!");
  },
});
