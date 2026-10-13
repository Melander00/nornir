import { useState, useTransition } from "react";
import useSWR from "swr";
import { TimeWheel } from "~/components/timewheel/TimeWheel";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "~/lib/redirect";
import type { ActiveLog, User } from "~/types";

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function LandingPage() {
    const { data: user, error: userError } = useSWR<User>("/api/me", fetcher)
    const { data: active, isLoading: activeLoading, mutate: mutateActive } = useSWR<ActiveLog|null>("/api/logs/active", async (url: string) => {
        const res = await fetch(url)
        // If the status code is not in the range 200-299,
        // we still try to parse and throw it.
        if (!res.ok) {
            return null
        }
        return res.json()
    })

    if(userError) {
        redirect("/login")
    }


    const [startTime, setStartTime] = useState(getCurrentMinutes);
    const [isRunning, startRunning] = useTransition()
    const [isSaving, startSaving] = useTransition()

    async function handleAction() {
        if(isRunning) {
            return;
        }

        startRunning(async () => {

            

        })
    }

    return (
        <>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <pre>{JSON.stringify(active, null, 2)}</pre>
        
        <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Time reporting
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isRunning
            ? "Your session is in progress"
            : "Select your start time"}
        </p>
      </div>


        <TimeWheel
            value={startTime}
            onChange={setStartTime}
            onAction={handleAction}
            step={1}
            actionLabel={
            isSaving
                ? "Saving..."
                : isRunning
                ? "End session"
                : "Start session"
            }
            disabled={isSaving}
        />
        </>
    )

}