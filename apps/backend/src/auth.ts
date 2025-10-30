import { dataSource } from "./database/better-auth-data-source.js";
import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

/**
 * Factory function that creates a Better Auth instance
 * using a given initialized TypeORM DataSource.
 */
export const auth = betterAuth({
  database: typeormAdapter(dataSource),
  plugins: [organization()],
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:5010"],
});