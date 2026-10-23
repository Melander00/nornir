import { mutate } from "swr";
import type { ActiveLog, LogEntry } from "~/types";
import { request } from "./fetcher";

function json(method: string, body: unknown): RequestInit {
    return {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    };
}

export type LogInput = {
    from: Date;
    to: Date;
    note: string;
};

export function createLog(input: LogInput) {
    return request<LogEntry | undefined>("/api/logs/create", json("POST", input));
}

export function editLog(input: LogInput & { id: string }) {
    return request<LogEntry>("/api/logs/edit", json("PUT", input));
}

export function deleteLog(id: string) {
    return request<void>(`/api/logs/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function startActive(from: Date) {
    return request<ActiveLog>("/api/logs/active", json("POST", { from }));
}

export function finishActive(input: { id: string; to: Date; note: string }) {
    return request<LogEntry>("/api/logs/active/finish", json("POST", input));
}

// Refetch every log list currently cached by useLogs, whatever its query.
export function revalidateLogs() {
    return mutate((key) => typeof key === "string" && key.startsWith("/api/logs?"));
}
