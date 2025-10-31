import { z } from "zod";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, "../../../.env.local") });

// Define schema for database configuration
const dbEnvSchema = z.object({
    DATABASE_TYPE: z.enum(["postgres", "mysql", "mariadb", "sqlite", "mssql"]).default("postgres"),
    DATABASE_HOST: z.string().min(1, "DATABASE_HOST is required"),
    DATABASE_PORT: z.coerce.number().int().positive().default(5432),
    DATABASE_USERNAME: z.string().min(1, "DATABASE_USERNAME is required"),
    DATABASE_PASSWORD: z.string().min(1, "DATABASE_PASSWORD is required"),
    DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),
    DATABASE_SYNCHRONIZE: z.string().optional().default("false"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Validate and export parsed environment variables
export const dbEnv = dbEnvSchema.parse(process.env);
