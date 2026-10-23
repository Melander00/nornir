export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function parseErrorMessage(text: string) {
    // The server answers with either plain text or { error: string }.
    try {
        const json = JSON.parse(text);
        if (typeof json?.error === "string") return json.error;
    } catch {}

    return text;
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const text = await res.text();

    if (!res.ok) {
        throw new ApiError(res.status, parseErrorMessage(text) || `${res.status} ${res.statusText}`);
    }

    return (text ? JSON.parse(text) : undefined) as T;
}

export const fetcher = (url: string) => request<any>(url);

export function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
}
