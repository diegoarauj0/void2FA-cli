import type { Algorithm, Encoding } from "@/domain/entities/account.entity.js";
import Joi from "joi";
import { commonValidators } from "./common.validator.js";

interface ICreateSchema {
  issuer: string;
  secret: string;
  name: string;
  algorithm?: Algorithm;
  encoding?: Encoding;
  counter?: number;
  period?: number;
  digits?: number;
  type?: "TOTP" | "HOTP";
}

const createSchema = Joi.object<ICreateSchema>({
  issuer: commonValidators.issuer.required(),
  secret: commonValidators.secret.required(),
  name: commonValidators.name.required(),
  algorithm: commonValidators.algorithm,
  encoding: commonValidators.encoding,
  counter: commonValidators.counter,
  period: commonValidators.period,
  digits: commonValidators.digits,
  type: commonValidators.type,
});

export const createValidator = (data: ICreateSchema): ICreateSchema | string => {
  const result = createSchema.validate(data);

  if (result.error?.message) return result.error.message;

  return result.value;
};
