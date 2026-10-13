
import "express-session";

declare module "express-session" {
  interface SessionData {
    oidc?: {
      state: string;
      nonce: string;
      codeVerifier: string;
    };

    user?: {
      provider: string;
      subject: string;
      username: string | null;
      name: string | null;
      picture: string | null;
    };
  }
}
