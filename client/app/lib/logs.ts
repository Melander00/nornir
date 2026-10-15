import type { LogEntry } from "~/types";
import { dayts } from "./dayjs";

export function calculateHours(log: LogEntry) {
    return Math.floor(dayts(log.to).diff(log.from, "minutes") / 6) / 10
}

export function getDayOfWeek(log: LogEntry) {
    return dayts(log.from).format("ddd")
}