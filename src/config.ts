import pkg from "../package.json" with { type: "json" };
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  bin: "void2fa",
  name: "void2fa",
  service: "void2fa",
  version: pkg.version,
  accountsFile: path.join(__dirname, "..", "accounts.enc"),
  debug: true,
  description: "A CLI tool for managing 2FA authentication accounts.",
};
