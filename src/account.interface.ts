export type AccountType = "TOTP" | "HOTP";
export type AlgorithmType = "SHA1" | "SHA256" | "SHA512";
export type EncodingType = "ASCII" | "HEX" | "BASE32" | "BASE64";

export interface Account {
  id: string;
  algorithm: AlgorithmType;
  digits: number;
  encoding: EncodingType;
  issuer: string;
  name: string;
  secret: string;
  period: number;
  counter: number;
  type: AccountType;
}
