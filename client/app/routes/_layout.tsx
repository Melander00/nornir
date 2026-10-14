import { Outlet } from "react-router";
import Top from "~/components/top/Top";
import { useUser } from "~/hooks/useUser";

export default function Layout() {

    useUser()

    return (
        <>
        
        <Top/>

        <Outlet/>

        </>
    )
}