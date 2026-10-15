import { calculateHours, getDayOfWeek } from "~/lib/logs";
import type { LogEntry } from "~/types";

export default function LogList({
    logs
}: {
    logs?: LogEntry[]
}) {
    return(
        <>

        <div className="flex flex-col px-4">

            {logs?.map(l => (
                <div key={l.id} className="flex flex-row justify-between p-1 odd:bg-gray-200 even:bg-gray-50 items-center gap-3">
                    <span className="flex-1">{getDayOfWeek(l)}</span>
                    <span className="flex-5">{l.note}</span>
                    <span className="flex-1 text-right">{calculateHours(l)} h</span>
                </div>
            ))}

        </div>
        
        </>
    )
}