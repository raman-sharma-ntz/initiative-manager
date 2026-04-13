import { clerkClient } from "@clerk/nextjs/server";

export const getGoogleOauthAccessToken = async (userId: string): Promise<string> => {
  try {
    const oauthTokens = await clerkClient.users.getUserOauthAccessToken(userId, "oauth_google");
    const token = oauthTokens?.[0]?.token;

    if (!token) {
      throw new Error("GOOGLE_OAUTH_NOT_CONNECTED");
    }

    return token;
  } catch (error) {
    const message = (error as Error).message || "";
    if (message.includes("GOOGLE_OAUTH_NOT_CONNECTED")) {
      throw error;
    }
    throw new Error("GOOGLE_OAUTH_TOKEN_ERROR");
  }
};
