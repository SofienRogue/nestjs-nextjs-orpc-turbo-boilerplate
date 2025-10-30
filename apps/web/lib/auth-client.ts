import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5010/api/auth",
}) as ReturnType<typeof createAuthClient>;