import { type FormEvent, useEffect, useState, useTransition } from "react";
import { createLog, deleteLog, editLog, revalidateLogs } from "~/lib/api";
import { dayts } from "~/lib/dayjs";
import { errorMessage } from "~/lib/fetcher";
import { formatHours } from "~/lib/logs";
import type { LogEntry } from "~/types";
import { Modal } from "../modal/Modal";
import { useNotifications } from "../notifications/useNotifications";

// The value format of <input type="datetime-local">.
const INPUT_FORMAT = "YYYY-MM-DDTHH:mm";

type LogEditorProps = {
    open: boolean;
    onClose: () => void;
    // Edit this log, or create a new one when left out.
    log?: LogEntry;
};

export function LogEditor({ open, onClose, log }: LogEditorProps) {
    const { addNotification } = useNotifications();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Reset the form every time it opens.
    useEffect(() => {
        if (!open) return;

        const now = dayts().startOf("minute");
        setFrom(dayts(log?.from ?? now.subtract(1, "hour")).format(INPUT_FORMAT));
        setTo(dayts(log?.to ?? now).format(INPUT_FORMAT));
        setNote(log?.note ?? "");
        setError(null);
        setConfirmDelete(false);
    }, [open, log]);

    const fromDate = dayts(from);
    const toDate = dayts(to);
    const isValidRange = fromDate.isValid() && toDate.isValid() && toDate.isAfter(fromDate);
    const hours = isValidRange ? Math.floor(toDate.diff(fromDate, "minutes") / 6) / 10 : 0;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isValidRange) {
            setError("End must be after start.");
            return;
        }

        startTransition(async () => {
            try {
                const input = { from: fromDate.toDate(), to: toDate.toDate(), note };

                if (log) {
                    await editLog({ id: log.id, ...input });
                } else {
                    await createLog(input);
                }

                await revalidateLogs();
                addNotification("Saved!", log ? "Updated your log." : "Added your log.", "success");
                onClose();
            } catch (e) {
                setError(errorMessage(e));
            }
        });
    }

    function handleDelete() {
        if (!log) return;

        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        startTransition(async () => {
            try {
                await deleteLog(log.id);
                await revalidateLogs();
                addNotification("Deleted", "Removed your log.", "info");
                onClose();
            } catch (e) {
                setError(errorMessage(e));
            }
        });
    }

    const inputClass = "w-full rounded-md border-2 border-gray-300 px-2 py-1.5 focus:border-indigo-700 focus:outline-none";

    return (
        <Modal open={open} onClose={onClose} title={log ? "Edit log" : "New log"}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Start
                    <input type="datetime-local" required value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium">
                    End
                    <input type="datetime-local" required value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium">
                    Note
                    <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} resize-none`} />
                </label>

                <p className="text-sm text-gray-500">Duration: {isValidRange ? formatHours(hours) : "–"}</p>

                {error && (
                    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <div className="mt-2 flex flex-row items-center gap-2">
                    {log && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                            {confirmDelete ? "Really delete?" : "Delete"}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
