import { calculateHours, formatHours, formatTimeRange } from "~/lib/logs";
import type { LogEntry } from "~/types";

export default function LogList({
    logs,
    onSelect,
}: {
    logs?: LogEntry[]
    onSelect?: (log: LogEntry) => void
}) {
    return(
        <ul className="flex flex-col">

            {logs?.map(l => (
                <li key={l.id} className="odd:bg-gray-100 even:bg-gray-50">
                    <button
                        type="button"
                        onClick={() => onSelect?.(l)}
                        disabled={!onSelect}
                        className="flex w-full flex-row items-center gap-3 p-2 text-left enabled:cursor-pointer enabled:hover:bg-indigo-50"
                    >
                        <span className="w-28 shrink-0 text-sm tabular-nums text-gray-600">{formatTimeRange(l)}</span>
                        <span className={`flex-1 truncate ${l.note ? "" : "italic text-gray-400"}`}>{l.note || "No note"}</span>
                        <span className="shrink-0 text-right tabular-nums">{formatHours(calculateHours(l))}</span>
                    </button>
                </li>
            ))}

        </ul>
    )
}
