import useSWR from "swr";
import { fetcher } from "~/lib/fetcher";
import type { LogEntry } from "~/types";

export function useLogs() {
    const {data: logs, isLoading, mutate: mutateLogs} = useSWR<LogEntry[]>("/api/logs", fetcher)

    return {logs, mutateLogs, isLoading}
}