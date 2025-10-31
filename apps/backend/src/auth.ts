import { dataSource } from "./database/better-auth-data-source.js";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { TypeormAdapter } from "./auth/adapter/typeorm-adapter.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });
/**
 * Factory function that creates a Better Auth instance
 * using a given initialized TypeORM DataSource.
 */
export const auth = betterAuth({
  database: TypeormAdapter(dataSource),
  plugins: [organization()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: { 
        clientId: process.env.GITHUB_CLIENT_ID as string, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:5010"],
});