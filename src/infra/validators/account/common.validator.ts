import type { Algorithm } from "@/domain/entities/account.entity.js";
import Joi from "joi";
import type { Encoding } from "node:crypto";

const STRING_MIN_1_MAX_128 = Joi.string().min(1).max(128);
const STRING_MIN_1_MAX_32 = Joi.string().min(1).max(32);

export const commonValidators = {
  counter: Joi.number().min(0).label("counter"),
  digits: Joi.number().min(1).label("digits"),
  period: Joi.number().min(1).label("period"),
  type: Joi.string().valid("HOTP", "TOTP").label("type"),
  algorithm: Joi.string<Algorithm>().uppercase().valid("SHA1", "SHA256", "SHA512").label("algorithm"),
  encoding: Joi.string<Encoding>().lowercase().valid("ascii", "hex", "base32", "base64").label("encoding"),
  issuer: STRING_MIN_1_MAX_128.label("issuer"),
  name: STRING_MIN_1_MAX_128.label("name"),
  secret: STRING_MIN_1_MAX_128.label("secret"),
  id: Joi.string().uuid().label("ID"),
  customId: STRING_MIN_1_MAX_32.label("customID"),
};
