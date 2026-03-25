import { Column, Entity, Index, PrimaryColumn } from "typeorm";
import { ACCOUNT_CONSTANT } from "./account.constant.js";

export type AccountType = "TOTP" | "HOTP";
export type AlgorithmType = "SHA1" | "SHA256" | "SHA512";
export type EncodingType = "ASCII" | "HEX" | "BASE32" | "BASE64";

@Entity({ name: "accounts" })
export class AccountEntity {
  @PrimaryColumn({ unique: true, generated: "uuid", nullable: false, type: "uuid" })
  public id!: string;

  @Column({ type: "varchar", enum: ACCOUNT_CONSTANT.ALGORITHMS, nullable: false, default: "SHA1" })
  public algorithm!: AlgorithmType;

  @Column({ type: "integer", nullable: false, default: 6 })
  public digits!: number;

  @Column({ type: "varchar", enum: ACCOUNT_CONSTANT.ENCODINGS, nullable: false, default: "ASCII" })
  public encoding!: EncodingType;

  @Index()
  @Column({ type: "varchar", nullable: false, default: "unknown" })
  public issuer!: string;

  @Index()
  @Column({ type: "varchar", nullable: false, default: "unknown" })
  public name!: string;

  @Column({ type: "varchar", nullable: false })
  public secret!: string;

  @Column({ type: "integer", nullable: false, default: 30 })
  public period!: number;

  @Column({ type: "integer", nullable: false, default: 0 })
  public counter!: number;

  @Column({ type: "varchar", enum: ACCOUNT_CONSTANT.TYPES, nullable: false, default: "TOTP" })
  public type!: AccountType;
}
