import { useState } from "react";
import { useSearchParams } from "react-router";
import { LogEditor } from "~/components/log-editor/LogEditor";
import LogList from "~/components/log-list/LogList";
import { useLogs } from "~/hooks/useLogs";
import { formatHours, groupByDay } from "~/lib/logs";
import type { LogEntry } from "~/types";

const PAGE_SIZE = 50

export default function LogsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const page = Math.max(0, Math.floor(Number(searchParams.get("page"))) || 0)

    const {logs, isLoading} = useLogs({limit: PAGE_SIZE, page})
    const groups = groupByDay(logs ?? [])
    const hasNextPage = logs?.length === PAGE_SIZE

    // null = closed, {} = new log, {log} = edit that log.
    const [editor, setEditor] = useState<{log?: LogEntry} | null>(null)

    function goToPage(next: number) {
        setSearchParams(next === 0 ? {} : {page: String(next)})
    }

    return(
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
            <div className="flex flex-row items-center justify-between">
                <h1 className="text-3xl">Logs</h1>
                <button
                    type="button"
                    onClick={() => setEditor({})}
                    className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
                >
                    Add log
                </button>
            </div>

            {isLoading && <p className="text-gray-500">Loading...</p>}

            {!isLoading && groups.length === 0 && (
                <p className="text-gray-500">{page === 0 ? "No logs yet." : "No more logs."}</p>
            )}

            {groups.map(group => (
                <section key={group.date.valueOf()} className="flex flex-col gap-1">
                    <div className="flex flex-row justify-between px-2 font-medium">
                        <h2>{group.date.format("ddd D MMM YYYY")}</h2>
                        <span className="tabular-nums">{formatHours(group.hours)}</span>
                    </div>
                    <LogList logs={group.logs} onSelect={log => setEditor({log})}/>
                </section>
            ))}

            {(page > 0 || hasNextPage) && (
                <div className="flex flex-row items-center justify-between">
                    <button
                        type="button"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 0}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-40"
                    >
                        Newer
                    </button>
                    <span className="text-sm text-gray-500">Page {page + 1}</span>
                    <button
                        type="button"
                        onClick={() => goToPage(page + 1)}
                        disabled={!hasNextPage}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-40"
                    >
                        Older
                    </button>
                </div>
            )}

            <LogEditor open={editor !== null} log={editor?.log} onClose={() => setEditor(null)}/>
        </main>
    )
}
