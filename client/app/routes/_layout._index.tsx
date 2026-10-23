import { useEffect, useState, useTransition } from "react";
import useSWR from "swr";
import { LogEditor } from "~/components/log-editor/LogEditor";
import { useNotifications } from "~/components/notifications/useNotifications";
import { TimeWheel } from "~/components/timewheel/TimeWheel";
import { revalidateLogs, finishActive, startActive } from "~/lib/api";
import { dayts } from "~/lib/dayjs";
import { errorMessage, fetcher } from "~/lib/fetcher";
import type { ActiveLog } from "~/types";

function getCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function formatElapsed(minutes: number) {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return hh > 0 ? `${hh} h ${mm} min` : `${mm} min`;
}

// Keep the note of a running session across page reloads.
function noteKey(activeId: string) {
    return `nornir:note:${activeId}`;
}

function loadNote(activeId: string) {
    try {
        return localStorage.getItem(noteKey(activeId)) ?? "";
    } catch {
        return "";
    }
}

function saveNote(activeId: string, note: string) {
    try {
        if (note) localStorage.setItem(noteKey(activeId), note);
        else localStorage.removeItem(noteKey(activeId));
    } catch {}
}

export default function LandingPage() {
    // The server answers null when no session is running.
    const { data: active, mutate: mutateActive } = useSWR<ActiveLog | null>("/api/logs/active", fetcher);

    const isRunning = !!active;

    const [startTime, setStartTime] = useState(getCurrentMinutes);
    const [isSaving, startSaving] = useTransition();
    const [note, setNote] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const {addNotification} = useNotifications()

    useEffect(() => {
        if (active) setNote(loadNote(active.id));
    }, [active?.id]);

    function handleNoteChange(value: string) {
        setNote(value);
        if (active) saveNote(active.id, value);
    }

    async function handleAction() {
        if (active) {
            startSaving(async () => {
                try {
                    await finishActive({
                        id: active.id,
                        to: dayts().toDate(),
                        note: note,
                    });
                } catch (e) {
                    addNotification("Could not save", errorMessage(e), "error");
                    return;
                }

                saveNote(active.id, "");
                setNote("");
                addNotification("Saved!", "Stored your log.", "success")

                await mutateActive(null, { revalidate: false });
                await revalidateLogs();
            });
            return;
        }

        const hh = Math.floor(startTime / 60);
        const mm = startTime - hh * 60;
        const from = dayts().startOf("minute").hour(hh).minute(mm);

        if (from.isAfter(dayts())) {
            addNotification("Can't start", "The start time can't be in the future.", "warning");
            return;
        }

        startSaving(async () => {
            try {
                const act = await startActive(from.toDate());
                await mutateActive(act, { revalidate: false });
                setStartTime(getCurrentMinutes)
            } catch (e) {
                addNotification("Could not start", errorMessage(e), "error");
            }
        });
    }

    // While running, the wheel shows the current time, which becomes the end time.
    useEffect(() => {
        if (!isRunning) return;

        const update = () => {
            setStartTime(getCurrentMinutes());

            timeout = setTimeout(update, 10000);
        };

        let timeout: ReturnType<typeof setTimeout>;

        update();

        return () => {
            clearTimeout(timeout);
        };
    }, [isRunning]);

    return (
        <div className="flex flex-col items-center h-full pt-5 gap-8 px-4">
            {active ? (
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-5xl">Session</h1>

                    <strong className="tabular-nums">
                        {dayts(active.from).format("HH:mm")} – now · {formatElapsed(dayts().diff(active.from, "minute"))}
                    </strong>

                    <label className="flex flex-col">
                        Notes:
                        <textarea rows={3} className="border-2 border-indigo-700 rounded-md resize-none" value={note} onChange={(e) => handleNoteChange(e.target.value)}></textarea>
                    </label>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-5xl">Spin</h1>
                    <p>and choose time</p>
                </div>
            )}

            <TimeWheel
                value={startTime}
                onChange={setStartTime}
                onAction={handleAction}
                step={1}
                actionLabel={isSaving ? "Saving..." : isRunning ? "End session" : "Start session"}
                disabled={isSaving}
                readOnly={isRunning}
            />

            <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className={[
                    "flex flex-row items-center gap-2 rounded-lg border-2 border-indigo-700",
                    "bg-white px-5 py-2.5 text-sm font-medium text-indigo-700 shadow-sm",
                    "transition hover:bg-indigo-50 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/40",
                ].join(" ")}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Log time manually
            </button>

            <LogEditor open={isEditorOpen} onClose={() => setIsEditorOpen(false)}/>
        </div>
    );
}
