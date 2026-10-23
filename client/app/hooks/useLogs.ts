import useSWR from "swr";
import { fetcher } from "~/lib/fetcher";
import type { LogEntry } from "~/types";

type UseLogsOptions = {
    limit?: number,
    page?: number,
    start?: string,
    end?: string,
}

export function useLogs(options: UseLogsOptions = {}) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) query.set(key, String(value))
    }

    const url = `/api/logs?${query}`
    const {data: logs, error, isLoading, mutate: mutateLogs} = useSWR<LogEntry[]>(url, fetcher)

    return {logs, error, mutateLogs, isLoading}
}
