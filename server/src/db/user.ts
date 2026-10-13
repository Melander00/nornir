import { prisma } from "../prisma/prisma.js";

export async function upsertUser(
    subject: string,
    name?: string,
    username?: string,
    picture?: string
) {
    await prisma.user.upsert({
        where: {
            subject
        },
        create: {
            subject,
            name,
            username,
            picture
        },
        update: {
            picture,
            name,
            username,
        }
    })
}