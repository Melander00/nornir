import { redirect } from "~/lib/redirect"

export default function Logout() {
    fetch("/api/auth/logout", {
        method: "post"
    }).then(() => {
        redirect("/login")
    })

    return (
        <></>
    )
}