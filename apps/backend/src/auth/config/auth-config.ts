import { z } from "zod";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment file
config({ path: join(__dirname, "../../.env.local") });

// Define schema for environment variables
const envSchema = z.object({
    GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
    GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
});

// Parse and validate process.env
export const authEnv = envSchema.parse(process.env);
