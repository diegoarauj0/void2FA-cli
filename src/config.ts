import pkg from "../package.json" with { type: "json" };

export class Config {
  public static IS_DEV = process.env.NODE_ENV === "dev";
  public static DESCRIPTION = pkg.description;
  public static VERSION = pkg.version;
  public static SERVICE = "void2fa";
  public static NAME = pkg.name;
  public static BIN = "void2fa";
}
