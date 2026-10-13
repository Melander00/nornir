import "dotenv/config";
import express from "express";
import { Session, SessionData } from "express-session";
import * as oidc from "openid-client";
import { upsertUser } from "./db/user.js";
import { ensureEnvs } from "./lib/ensureEnv.js";

const [GITLAB_ISSUER, GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, SESSION_SECRET, BACKEND_URL, FRONTEND_URL] = ensureEnvs(
    ["GITLAB_ISSUER", "GITLAB_CLIENT_ID", "GITLAB_CLIENT_SECRET", "SESSION_SECRET", "BACKEND_URL", "FRONTEND_URL"],
    true,
);

const config = await oidc.discovery(new URL(GITLAB_ISSUER), GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET);

const r = express.Router()
const callbackUrl = `${BACKEND_URL}/auth/callback/gitlab`;

export const authRouter = r


r.get("/login", async (req, res, next) => {
    try {
        const state = oidc.randomState();
        const nonce = oidc.randomNonce();
        const codeVerifier = oidc.randomPKCECodeVerifier();
        const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

        req.session.oidc = {
            state,
            nonce,
            codeVerifier,
        };

        // Ensure the session is saved before redirecting to GitLab.
        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        const url = oidc.buildAuthorizationUrl(config, {
            redirect_uri: callbackUrl,
            response_type: "code",
            scope: "openid profile",
            state,
            nonce,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        res.redirect(url.href);
    } catch (err) {
        next(err);
    }
});

const getStringClaim = (value: unknown): string | null => {
    return typeof value === "string" ? value : null;
};


r.get("/callback/gitlab", async (req, res, next) => {
    try {
        const saved = req.session.oidc;

        
        if (!saved) {
            return res.status(400).send("Login session expired. Try again.");
        }

        const cb = new URL(callbackUrl);
        cb.search = new URLSearchParams(
            req.query as Record<string, string>
        ).toString();

        const tokens = await oidc.authorizationCodeGrant(config, cb, {
            expectedState: saved.state,
            expectedNonce: saved.nonce,
            pkceCodeVerifier: saved.codeVerifier,
        });

        const claims = tokens.claims();

        if (!claims?.sub) {
            return res.status(401).send("Missing OIDC identity");
        }

        // Use the validated OIDC subject as the external identity.
        const user = {
            provider: GITLAB_ISSUER,
            subject: claims.sub,
            username: getStringClaim(claims.preferred_username) ?? getStringClaim(claims.nickname),
            name: getStringClaim(claims.name),
            picture: getStringClaim(claims.picture),
        };

        // TODO: Find or create the user in your database here.
        // Store your LOCAL database user ID in the session, not tokens.
        await upsertUser(user.subject, user.name || undefined, user.username || undefined, user.picture || undefined)

        // Rotate the session ID after successful authentication.
        await new Promise<void>((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        req.session.user = user;

        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.redirect(`${FRONTEND_URL}`);
    } catch (err) {
          if (err instanceof Error) {
            console.error("OIDC error:", err.name, err.message);

            const details = err as Error & {
            status?: number;
            code?: string;
            cause?: unknown;
            };

            console.dir(
            {
                status: details.status,
                code: details.code,
                cause: details.cause,
            },
            { depth: 5 }
            );
        }
        next(err);
    }
});


r.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);

        res.clearCookie("app.sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: BACKEND_URL.startsWith("https://"),
        });

        res.sendStatus(204);
    });
});

export function enforceAuth(session: Session & Partial<SessionData>) {
    if (!session.user) return null;

    return session.user.subject
}