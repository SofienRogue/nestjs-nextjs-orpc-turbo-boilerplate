import { DataSource, DataSourceOptions } from "typeorm";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { dbEnv } from './config/better-auth-data-source.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const dataSource = new DataSource({
  type: dbEnv.DATABASE_TYPE,
  host: dbEnv.DATABASE_HOST,
  port: dbEnv.DATABASE_PORT,
  username: dbEnv.DATABASE_USERNAME,
  password: dbEnv.DATABASE_PASSWORD,
  database: dbEnv.DATABASE_NAME,
  entities: [join(__dirname, "../auth/entities/**/*.{ts,js}")],
  migrations: [join(__dirname, "migrations/**/*.{ts,js}")],
  synchronize: dbEnv.DATABASE_SYNCHRONIZE === "true",
  logging: dbEnv.NODE_ENV !== "production",
} as DataSourceOptions);

await dataSource.initialize();