import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma_client/client.js";
import { ensureEnvs } from "../lib/ensureEnv.js";
const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const [USER, PASSWORD, HOST, PORT, DB] = ensureEnvs([
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB",
], true)

const URL = `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`
const adapter = new PrismaPg({
    connectionString: URL,
});
const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });
if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
export { prisma };
