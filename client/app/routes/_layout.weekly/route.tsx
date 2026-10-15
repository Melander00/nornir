import LogList from "~/components/log-list/LogList";
import { useLogs } from "~/hooks/useLogs";
import { useUser } from "~/hooks/useUser";
import { dayts } from "~/lib/dayjs";
import { calculateHours } from "~/lib/logs";

function getMonday0000() {
    return dayts().tz().utc().day(1).startOf("day").toISOString()
}

function getSunday2359() {
    return dayts().tz().utc().day(7).endOf("day").toISOString()
}

function getWeek() {
    return dayts().week()
}

export default function LogsPage() {
    const {user} = useUser()

    const {logs} = useLogs({
        from: getMonday0000(),
        to: getSunday2359()
    })

    return(
        <>
        <div>
            <h1>Week {getWeek()}</h1>
            <p>Total {logs?.reduce((prev, curr) => prev + calculateHours(curr), 0)} h</p>
        </div>

        <LogList logs={logs}/>

        <div className="flex flex-col gap-2">
            {/* {logs?.map(e => (
                <div key={e.id} className="flex flex-col gap-px">
                    <span>{dayts(e.from).format("YYYY-MM-DD HH:mm")} - {dayts(e.to).format("YYYY-MM-DD HH:mm")}</span>
                    <span>{e.note}</span>
                </div>
            ))} */}
        </div>
        
        {/* <pre>{JSON.stringify(logs, null, 2)}</pre> */}
        
        </>
    )
}