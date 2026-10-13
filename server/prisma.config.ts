/// <reference types="node" />

import "dotenv/config";
import { defineConfig } from "prisma/config";


const URL = `postgresql://${process.env["POSTGRES_USER"]}:${process.env["POSTGRES_PASSWORD"]}@${process.env["POSTGRES_HOST"]}:${process.env["POSTGRES_PORT"]}/${process.env["POSTGRES_DB"]}`
// const URL = process.env['DATABASE_URL']

export default defineConfig({
  schema: "prisma/",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    // url: env("DATABASE_URL"),
    url: URL,
    // url: `postgresql://${env("POSTGRES_USER")}:${env("POSTGRES_PASSWORD")}@${env("POSTGRES_HOST")}:${env("POSTGRES_PORT")}/${env("POSTGRES_DB")}`,
  },
});