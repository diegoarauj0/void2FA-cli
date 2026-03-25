import { Config } from "@/config.js";
import { loggerDebug, loggerError } from "@/core/logger.js";

export interface InterfaceApplicationCommandOptions {
  description?: string;
  param?: string;
  alias: string;
  name: string;
}

export interface InterfaceExamples {
  command: string;
  comment: string;
}

export abstract class ApplicationCommand<Options extends {} = {}> {
  public abstract readonly description: string;
  public abstract readonly name: string;

  public readonly options: InterfaceApplicationCommandOptions[] = [];
  public readonly arguments: { name: string; required?: boolean }[] = [];
  public readonly examples: InterfaceExamples[] = [];

  protected abstract main(options: Options): Promise<void>;

  public action = async (...params: any[]): Promise<void> => {

    let options: Record<string, string | undefined> = {};

    this.arguments.forEach(({ name }, index) => {
      if (typeof params[index] === "string") {
        options[name.replace("?", "")] = params[index];
        return;
      }

      options[name] = undefined;
    });

    if (this.arguments) {
      for (const value of params) {
        if (typeof value === "object") {
          options = { ...options, ...value };
          break;
        }
      }
    }

    await this.errorHandler(async () => {
      await this.main(options as Options);
    });
  };

  public async errorHandler(callback: () => Promise<void>): Promise<void> {
    try {
      await callback();
    } catch (err) {
      loggerError("Error: " + String(err instanceof Error ? err.message : String(err)));

      if (Config.IS_DEV) loggerDebug("Error:", err);
    }
  }
}
