import useSWR from "swr";
import { fetcher } from "~/lib/fetcher";
import type { LogEntry } from "~/types";

type UseLogsOptions = {
    limit?: string,
    page?: string,
    from?: string,
    to?: string,
}

export function useLogs(options?: UseLogsOptions) {
    const query = new URLSearchParams(options)
    const url = `/api/logs?${query}`
    const {data: logs, isLoading, mutate: mutateLogs} = useSWR<LogEntry[]>(url, fetcher)

    return {logs, mutateLogs, isLoading}
}