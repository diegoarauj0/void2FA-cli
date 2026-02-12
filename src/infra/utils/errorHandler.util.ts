import config from "@/config.js";
import { loggerError } from "./logger.util.js";

export default function (callback: (...args: any[]) => Promise<void>) {
  return async (...args: any[]) => {
    try {
      await callback(...args);
    } catch (err) {
      loggerError("Error: " + String(err instanceof Error ? err.message : String(err)));

      if (config.debug) {
        console.error(err);
      }
    }
  };
}
