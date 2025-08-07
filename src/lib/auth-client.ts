import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});

export const refreshSession = async () => {
  try {
    await authClient.getSession();
    return true;
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return false;
  }
};
