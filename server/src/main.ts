import cors from "cors";
import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import session from "express-session";
import memstore from "memorystore";
import { authRouter } from "./auth.js";
import { ensureEnvs } from "./lib/ensureEnv.js";
import { logsRouter } from "./logs.js";
import { prisma } from "./prisma/prisma.js";

const [GITLAB_ISSUER, GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, SESSION_SECRET, BACKEND_URL, FRONTEND_URL] = ensureEnvs(
    ["GITLAB_ISSUER", "GITLAB_CLIENT_ID", "GITLAB_CLIENT_SECRET", "SESSION_SECRET", "BACKEND_URL", "FRONTEND_URL"],
    true,
);

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    session({
        name: "app.sid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            httpOnly: true,
            secure: BACKEND_URL.startsWith("https://"),
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
        store: new (memstore(session))({
            checkPeriod: 24 * 60 * 60 * 1000
        })
    }),
);


app.use("/auth", authRouter)
app.use("/logs", logsRouter)

// Return the current authenticated user.
app.get("/me", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: {
            subject: req.session.user.subject
        }
    })

    res.json(user);
});


const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    console.error("Request failed:", error);

    if (res.headersSent) {
        next(error);
        return;
    }

    res.status(500).send("Authentication failed.");
};

app.use(errorHandler);

app.listen(3000, (err) => {
    if(err) {
        throw err
    }
    console.log(`Express listening on ${BACKEND_URL}`);
});
