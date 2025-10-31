import { createAuthClient } from "better-auth/react";
import { Env } from "./Env";

export const authClient = createAuthClient({
  baseURL: `${Env.NEXT_PUBLIC_API_URL}/api/auth`,
}) as ReturnType<typeof createAuthClient>;