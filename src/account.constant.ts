export class ACCOUNT_CONSTANT {
  public static readonly ISSUER_LENGTH_MIN = 1;
  public static readonly ISSUER_LENGTH_MAX = 32;

  public static readonly NAME_LENGTH_MIN = 1;
  public static readonly NAME_LENGTH_MAX = 32;

  public static readonly SECRET_LENGTH_MIN = 1;
  public static readonly SECRET_LENGTH_MAX = 255;

  public static readonly COUNTER_MIN = 0;
  public static readonly COUNTER_MAX = Number.MAX_SAFE_INTEGER;
  public static readonly COUNTER_DEFAULT = 0;

  public static readonly DIGITS_MIN = 1;
  public static readonly DIGITS_MAX = 64;
  public static readonly DIGITS_DEFAULT = 6;

  public static readonly PERIOD_MIN = 1;
  public static readonly PERIOD_MAX = Number.MAX_SAFE_INTEGER;
  public static readonly PERIOD_DEFAULT = 30;

  public static readonly ALGORITHMS = ["SHA1", "SHA256", "SHA512"];
  public static readonly ALGORITHM_DEFAULT = "SHA1";

  public static readonly ENCODINGS = ["ASCII" , "HEX" , "BASE32" , "BASE64"];

  public static readonly TYPES = ["HOTP" , "TOTP"];
  public static readonly TYPE_DEFAULT = "TOTP"
}
