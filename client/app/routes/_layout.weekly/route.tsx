import { useState } from "react";
import { useSearchParams } from "react-router";
import { LogEditor } from "~/components/log-editor/LogEditor";
import LogList from "~/components/log-list/LogList";
import { useLogs } from "~/hooks/useLogs";
import { dayts } from "~/lib/dayjs";
import { formatHours, sumHours } from "~/lib/logs";
import type { LogEntry } from "~/types";

// ?week=<any date in the week>, defaulting to the current week.
function parseWeek(param: string | null) {
    const date = param ? dayts(param) : dayts()
    return (date.isValid() ? date : dayts()).startOf("isoWeek")
}

export default function WeeklyPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const weekStart = parseWeek(searchParams.get("week"))
    const weekEnd = weekStart.endOf("isoWeek")
    const isCurrentWeek = weekStart.isSame(dayts().startOf("isoWeek"))

    const {logs, isLoading} = useLogs({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
    })

    // null = closed, {} = new log, {log} = edit that log.
    const [editor, setEditor] = useState<{log?: LogEntry} | null>(null)

    const days = Array.from({length: 7}, (_, i) => {
        const date = weekStart.add(i, "day")
        const dayLogs = (logs ?? [])
            .filter(l => dayts(l.from).isSame(date, "day"))
            .sort((a, b) => dayts(a.from).valueOf() - dayts(b.from).valueOf())

        return {date, logs: dayLogs, hours: sumHours(dayLogs)}
    })

    function goToWeek(date: typeof weekStart) {
        const isCurrent = date.isSame(dayts().startOf("isoWeek"))
        setSearchParams(isCurrent ? {} : {week: date.format("YYYY-MM-DD")})
    }

    const navButton = "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-40"

    return(
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <button type="button" onClick={() => goToWeek(weekStart.subtract(1, "week"))} className={navButton} aria-label="Previous week">
                    ‹
                </button>

                <div className="flex flex-col items-center">
                    <h1 className="text-3xl">Week {weekStart.isoWeek()}</h1>
                    <p className="text-sm text-gray-500">
                        {weekStart.format("D MMM")} – {weekEnd.format("D MMM YYYY")}
                    </p>
                </div>

                <button type="button" onClick={() => goToWeek(weekStart.add(1, "week"))} className={navButton} aria-label="Next week">
                    ›
                </button>
            </div>

            <div className="flex flex-row items-center justify-between">
                <p className="text-lg">
                    Total <strong className="tabular-nums">{logs ? formatHours(days.reduce((total, day) => total + day.hours, 0)) : "–"}</strong>
                </p>

                <div className="flex flex-row gap-2">
                    {!isCurrentWeek && (
                        <button type="button" onClick={() => goToWeek(dayts().startOf("isoWeek"))} className={navButton}>
                            This week
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setEditor({})}
                        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
                    >
                        Add log
                    </button>
                </div>
            </div>

            {isLoading && <p className="text-gray-500">Loading...</p>}

            {days.map(day => (
                <section key={day.date.valueOf()} className="flex flex-col gap-1">
                    <div className="flex flex-row justify-between px-2 font-medium">
                        <h2>{day.date.format("dddd D MMM")}</h2>
                        <span className="tabular-nums">{formatHours(day.hours)}</span>
                    </div>

                    {day.logs.length > 0
                        ? <LogList logs={day.logs} onSelect={log => setEditor({log})}/>
                        : <p className="px-2 text-sm text-gray-400">No logs</p>}
                </section>
            ))}

            <LogEditor open={editor !== null} log={editor?.log} onClose={() => setEditor(null)}/>
        </main>
    )
}
