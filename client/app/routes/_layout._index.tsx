import { useEffect, useState, useTransition } from "react";
import useSWR from "swr";
import { useNotifications } from "~/components/notifications/useNotifications";
import { TimeWheel } from "~/components/timewheel/TimeWheel";
import { dayts } from "~/lib/dayjs";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "~/lib/redirect";
import type { ActiveLog, User } from "~/types";

function getCurrentMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

export default function LandingPage() {
    const { data: user, error: userError } = useSWR<User>("/api/me", fetcher);
    const {
        data: active,
        isLoading: activeLoading,
        mutate: mutateActive,
    } = useSWR<ActiveLog | undefined>("/api/logs/active", async (url: string) => {
        const res = await fetch(url);
        // If the status code is not in the range 200-299,
        // we still try to parse and throw it.
        if (!res.ok) {
            return undefined;
        }

        const json = await res.json();

        if (json === null) return undefined;

        return json;
    });

    if (userError) {
        redirect("/login");
    }

    const isRunning = active !== undefined;

    

    

    const [startTime, setStartTime] = useState(getCurrentMinutes);
    const [isSaving, startSaving] = useTransition();
    const [note, setNote] = useState("");

    const {addNotification} = useNotifications()

    async function handleAction() {
        if (isRunning) {
            startSaving(async () => {
                const res = await fetch("/api/logs/active/finish", {
                    method: "post",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({
                        id: active.id,
                        to: dayts().toDate(),
                        note: note,
                    }),
                });

                if (!res.ok) {
                    alert(`${res.status} ${await res.text()}`);
                    return;
                }

                addNotification("Saved!", "Stored your log.", "success")

                const log = await res.json();
                mutateActive(undefined);
            });
            return;
        }

        startSaving(async () => {
            const hh = Math.floor(startTime / 60);
            const mm = startTime - hh * 60;

            const d = dayts().hour(hh).minute(mm);

            const res = await fetch("/api/logs/active", {
                method: "post",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    from: d.toDate(),
                }),
            });

            if (!res.ok) {
                alert(`${res.status} ${res.statusText}`);
                return;
            }

            const act = await res.json();
            mutateActive(act);
            setStartTime(getCurrentMinutes)
        });
    }

    useEffect(() => {

        let timeout: ReturnType<typeof setTimeout>

        function updateStartTime() {
            if (isRunning) {
                setStartTime(getCurrentMinutes)            
                timeout = setTimeout(updateStartTime, 10000)
            }
        }

        if(isRunning) {
            updateStartTime()
        }

        () => {
            clearTimeout(timeout)
        }
    }, [isRunning])

    

    return (
        <div className="flex flex-col items-center h-full pt-5 gap-8">
            {isRunning ? (
                <>
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-5xl">Session</h1>

                        <strong>{dayts(active.from).format("HH:mm")} - ?</strong>

                        <p>Notes:</p>
                        <textarea className="border-2" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                    </div>
                </>
            ) : (
                (
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-5xl">Spin</h1>
                        <p>and choose time</p>
                    </div>
                )
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
        </div>
    );
}
