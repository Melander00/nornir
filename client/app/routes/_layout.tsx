import { Outlet } from "react-router";
import NotificationsView from "~/components/notifications/Notifications";
import { NotificationsProvider } from "~/components/notifications/useNotifications";
import Top from "~/components/top/Top";
import { useUser } from "~/hooks/useUser";

export default function Layout() {

    useUser()

    return (
        <>
        

        <NotificationsProvider>
            <Top/>
            <Outlet/>
            <NotificationsView/>
        </NotificationsProvider>

        </>
    )
}