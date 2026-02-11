import type { Algorithm, Encoding } from "@/domain/entities/account.entity.js";
import Joi from "joi";
import { commonValidators } from "./common.validator.js";

interface IEditSchema {
  issuer?: string;
  secret?: string;
  name?: string;
  algorithm?: Algorithm;
  encoding?: Encoding;
  counter?: number;
  period?: number;
  digits?: number;
  type?: "TOTP" | "HOTP";
  customID?: string;
}

const editSchema = Joi.object<IEditSchema>({
  issuer: commonValidators.issuer,
  secret: commonValidators.secret,
  name: commonValidators.name,
  algorithm: commonValidators.algorithm,
  encoding: commonValidators.encoding,
  counter: commonValidators.counter,
  period: commonValidators.period,
  digits: commonValidators.digits,
  type: commonValidators.type,
  customID: commonValidators.customId,
});

export const editValidator = (data: IEditSchema): IEditSchema | string => {
  const result = editSchema.validate(data);

  if (result.error?.message) return result.error.message;

  return result.value;
};
