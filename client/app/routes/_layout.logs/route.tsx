import { useLogs } from "~/hooks/useLogs";
import { useUser } from "~/hooks/useUser";
import { dayts } from "~/lib/dayjs";

export default function LogsPage() {
    const {user} = useUser()

    const {logs} = useLogs()

    return(
        <>
        <div className="flex flex-col gap-2">
            {logs?.map(e => (
                <div key={e.id} className="flex flex-col gap-px">
                    <span>{dayts(e.from).format("YYYY-MM-DD HH:mm")} - {dayts(e.to).format("YYYY-MM-DD HH:mm")}</span>
                    <span>{e.note}</span>
                </div>
            ))}
        </div>
        
        {/* <pre>{JSON.stringify(logs, null, 2)}</pre> */}
        
        </>
    )
}