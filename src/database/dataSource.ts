import { fileURLToPath } from "node:url";
import { DataSource } from "typeorm";
import envPaths from "env-paths";
import path from "node:path";

const data = envPaths("void2fa").data;
const isDev = process.env.NODE_ENV === "dev";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename));

export const dataSource = new DataSource({
  database: isDev ? `${__dirname}/../../SQLite.db` : `${data}/SQLite.db`,
  synchronize: isDev,
  entities: isDev ? ["src/**/*.entity.ts"] : ["dist/**/*.entity.js"],
  migrations: isDev ? ["src/migrations/*.ts"] : ["dist/migrations/*.js"],
  migrationsRun: true,
  type: "better-sqlite3",
});
