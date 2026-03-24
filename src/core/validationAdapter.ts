import type { Schema } from "joi";

export default function (schema: Schema, value: any): string | true {
  const result = schema.validate(value);
  return result.error?.message || true;
}
