import type { Dayjs } from "dayjs";
import type { LogEntry } from "~/types";
import { dayts } from "./dayjs";

export function calculateHours(log: LogEntry) {
    return Math.floor(dayts(log.to).diff(log.from, "minutes") / 6) / 10
}

export function sumHours(logs: LogEntry[]) {
    return logs.reduce((total, log) => total + calculateHours(log), 0)
}

export function formatHours(hours: number) {
    // toFixed hides float noise such as 0.1 + 0.2.
    return `${hours.toFixed(1)} h`
}

export function formatTimeRange(log: LogEntry) {
    const from = dayts(log.from)
    const to = dayts(log.to)
    const days = to.startOf("day").diff(from.startOf("day"), "day")

    return `${from.format("HH:mm")}–${to.format("HH:mm")}${days > 0 ? ` +${days}` : ""}`
}

export function getDayOfWeek(log: LogEntry) {
    return dayts(log.from).format("ddd")
}

export type DayGroup = {
    date: Dayjs
    logs: LogEntry[]
    hours: number
}

// Groups logs by the day they started, keeping the input order.
export function groupByDay(logs: LogEntry[]): DayGroup[] {
    const groups = new Map<string, DayGroup>()

    for (const log of logs) {
        const date = dayts(log.from).startOf("day")
        const key = date.format("YYYY-MM-DD")

        let group = groups.get(key)
        if (!group) {
            group = { date, logs: [], hours: 0 }
            groups.set(key, group)
        }

        group.logs.push(log)
        group.hours += calculateHours(log)
    }

    return [...groups.values()]
}
