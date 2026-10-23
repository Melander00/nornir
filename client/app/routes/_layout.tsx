import { Outlet } from "react-router";
import NotificationsView from "~/components/notifications/Notifications";
import { NotificationsProvider } from "~/components/notifications/useNotifications";
import { Sidebar } from "~/components/sidebar/Sidebar";
import Top from "~/components/top/Top";
import { useUser } from "~/hooks/useUser";

export default function Layout() {

    useUser()

    return (
        <NotificationsProvider>
            <div className="flex min-h-dvh flex-row">
                {/* Desktop only, phones use the drawer in Top. */}
                <Sidebar className="hidden md:flex"/>

                <div className="flex min-w-0 flex-1 flex-col">
                    <Top/>
                    <Outlet/>
                </div>
            </div>

            <NotificationsView/>
        </NotificationsProvider>
    )
}
