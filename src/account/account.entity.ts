type TOTPConfig = {
  type: "TOTP";
  period: number;
};

type HOTPConfig = {
  type: "HOTP";
  counter: number;
};

type OTPConfig = TOTPConfig | HOTPConfig;

export type Algorithm = "SHA1" | "SHA256" | "SHA512";
export type Encoding = "ascii" | "hex" | "base32" | "base64";

interface IAccountBase {
  id: string;
  customID?: string | undefined;
  secret: string;
  digits: number;
  algorithm: Algorithm;
  issuer: string;
  name: string;
  encoding: Encoding;
}

interface IAccount extends IAccountBase {
  OTPConfig: OTPConfig;
}

export class AccountEntity implements IAccount {
  constructor(
    public algorithm: Algorithm,
    public digits: number,
    public encoding: Encoding,
    public id: string,
    public issuer: string,
    public name: string,
    public secret: string,
    public OTPConfig: OTPConfig,
    public customID?: string | undefined
  ) {}

  public static create(account: IAccount): AccountEntity {
    return new AccountEntity(
      account.algorithm,
      account.digits,
      account.encoding,
      account.id,
      account.issuer,
      account.name,
      account.secret,
      account.OTPConfig,
      account.customID
    );
  }
}
