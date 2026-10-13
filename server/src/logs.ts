import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import express from "express";
import z from "zod/v4";
import { enforceAuth } from "./auth.js";
import { Prisma } from "./generated/prisma_client/client.js";
import { dayts } from "./lib/dayjs.js";
import { prisma } from "./prisma/prisma.js";

const r = express.Router();
export const logsRouter = r;

r.get("/", async (req, res, next) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const { limit, start, end, page } = req.query;

    // Reject duplicate query parameters and non-string values.
    if (
        (start !== undefined && typeof start !== "string") ||
        (end !== undefined && typeof end !== "string") ||
        (limit !== undefined && typeof limit !== "string") ||
        (page !== undefined && typeof page !== "string")
    ) {
        res.status(400).json({ error: "Invalid query parameters" });
        return;
    }

    // Require both dates, or neither.
    if ((start === undefined) !== (end === undefined)) {
        res.status(400).json({
            error: "Both start and end must be provided",
        });
        return;
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (start !== undefined && end !== undefined) {
        const s = dayts(start);
        const e = dayts(end);

        if (!s.isValid() || !e.isValid()) {
            res.status(400).json({ error: "Invalid date" });
            return;
        }

        startDate = s.toDate();
        endDate = e.toDate();

        if (startDate >= endDate) {
            res.status(400).json({
                error: "start must be before end",
            });
            return;
        }
    }

    // Default to 200; accept integers from 1 to 1000.
    let take = 200;
    let skip = 0;

    if (limit !== undefined) {
        if (!/^\d+$/.test(limit)) {
            res.status(400).json({
                error: "limit must be a positive integer",
            });
            return;
        }

        take = Number(limit);

        if (!Number.isSafeInteger(take) || take < 1 || take > 1000) {
            res.status(400).json({
                error: "limit must be between 1 and 1000",
            });
            return;
        }
    }

    if (page !== undefined) {
        if (!/^\d+$/.test(page)) {
            res.status(400).json({
                error: "page must be a positive integer",
            });
            return;
        }

        skip = Number(page) * take;
    }

    const where: Prisma.LogEntryWhereInput = {
        user: { subject },
        ...(startDate && endDate
            ? {
                  from: { lte: endDate },
                  to: { gte: startDate },
              }
            : {}),
    };

    try {
        const logs = await prisma.logEntry.findMany({
            where,
            take,
            skip,
            orderBy: [{ from: "desc" }, { id: "desc" }],
        });

        res.json(logs);
    } catch (error) {
        next(error);
    }
});

const postCreateLogSchema = z.object({
    from: z.date().nonoptional(),
    to: z.date().nonoptional(),
    note: z.string().optional(),
});
r.post("/create", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const body = req.body;
    const { data, success } = postCreateLogSchema.safeParse(body);

    if (!success) {
        res.status(400).send("Bad requests");
        return;
    }

    try {
        const log = await prisma.logEntry.create({
            data: {
                user: {
                    connect: {
                        subject
                    }
                },
                note: data.note,
                from: data.from,
                to: data.to
            }
        })
    } catch(e) {
        if (e instanceof Error) {
            res.status(500).send(e.message);
        } else {
            res.status(500).send("internal error");
        }
    }
});

const postEditLogSchema = z.object({
    id: z.uuidv7().nonoptional(),
    from: z.date().optional(),
    to: z.date().optional(),
    note: z.string().optional(),
});
r.put("/edit", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const body = req.body;
    const { data, success } = postEditLogSchema.safeParse(body);

    if (!success) {
        res.status(400).send("Bad requests");
        return;
    }

    try {
        const log = await prisma.logEntry.update({
            where: {
                id: data.id,
                user: {
                    subject
                }
            },
            data: {
                from: data.from || Prisma.skip,
                to: data.to || Prisma.skip,
                note: data.note || Prisma.skip,
            },
        });

        res.json(log)
    } catch (e) {
        if(e instanceof PrismaClientKnownRequestError) {
            if (e.code === "P2025") {
                res.status(404).send("Log not found")
                return
            }
        }

        if (e instanceof Error) {
            res.status(500).send(e.message);
        } else {
            res.status(500).send("internal error");
        }
    }
});

r.delete("/:id", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const id = req.params.id;

    const log = await prisma.logEntry.findUnique({
        where: {
            id,
            user: {
                subject,
            },
        },
    });

    if (!log) {
        res.status(404).send("Log not found");
        return;
    }

    try {
        await prisma.logEntry.delete({
            where: {
                id,
                user: {
                    subject,
                },
            },
        });
    } catch (e) {
        if (e instanceof Error) {
            res.status(500).send(e.message);
        } else {
            res.status(500).send("internal error");
        }
    }
});

r.get("/active", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const active = await prisma.activeLog.findFirst({
        where: {
            user: {
                subject,
            },
        },
    });

    if (!active) {
        res.json(null);
        return;
    }

    res.json(active);
});

const postActiveSchema = z.object({
    from: z.date().nonoptional(),
});
r.post("/active", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const body = req.body;
    const { data, success } = postActiveSchema.safeParse(body);

    if (!success) {
        res.status(400).send("Bad requests");
        return;
    }

    try {
        const active = await prisma.activeLog.create({
            data: {
                user: {
                    connect: {
                        subject,
                    },
                },
                from: data.from,
            },
        });

        res.json(active);
    } catch (e) {
        if (e instanceof Error) {
            res.status(500).send(e.message);
        } else {
            res.status(500).send("internal error");
        }
    }
});

const postFinishActiveSchema = z.object({
    id: z.uuidv7().nonoptional(),
    to: z.date().nonoptional(),
    note: z.string().optional(),
});
r.post("/active/finish", async (req, res) => {
    const subject = enforceAuth(req.session);
    if (!subject) {
        res.status(401).send("Your credentials have expired");
        return;
    }

    const body = req.body;
    const { data, success } = postFinishActiveSchema.safeParse(body);

    if (!success) {
        res.status(400).send("Bad requests");
        return;
    }

    const active = await prisma.activeLog.findFirst({
        where: {
            user: {
                subject,
            },
            id: data.id,
        },
    });

    if (!active) {
        res.status(404).send("No active log");
        return;
    }

    if (!dayts(data.to).isAfter(active.from)) {
        res.status(400).send("To may not be before from");
        return;
    }

    try {
        const log = await prisma.$transaction(async (tx) => {
            const log = await tx.logEntry.create({
                data: {
                    user: {
                        connect: {
                            subject,
                        },
                    },
                    from: active.from,
                    to: data.to,
                    note: data.note,
                },
            });

            await tx.activeLog.delete({
                where: {
                    id: data.id,
                },
            });

            return log;
        });

        res.json(log);
    } catch (e) {
        if (e instanceof Error) {
            res.status(500).send(e.message);
        } else {
            res.status(500).send("internal error");
        }
    }
});
