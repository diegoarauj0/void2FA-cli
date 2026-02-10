import Joi from "joi";

const STRING_MIN_1_MAX_128 = Joi.string().min(1).max(128);
const STRING_MIN_1_MAX_32 = Joi.string().min(1).max(32);

export const accountValidators = {
  counter: Joi.number().min(0).label("counter"),
  digits: Joi.number().min(1).label("digits"),
  period: Joi.number().min(1).label("period"),
  type: Joi.string().valid("HOTP", "TOTP").label("type"),
  algorithm: Joi.string().lowercase().valid("sha1", "sha256", "sha512").label("algorithm"),
  encoding: Joi.string().valid("ascii", "hex", "base32", "base64").label("encoding"),
  issuer: STRING_MIN_1_MAX_128.label("issuer"),
  name: STRING_MIN_1_MAX_128.label("name"),
  secret: STRING_MIN_1_MAX_128.label("secret"),
  id: Joi.string().uuid().label("ID"),
  customId: STRING_MIN_1_MAX_32.label("customID"),
};
