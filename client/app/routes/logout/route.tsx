import { useEffect } from "react"
import { redirect } from "~/lib/redirect"

export default function Logout() {
    useEffect(() => {
        fetch("/api/auth/logout", {
            method: "post"
        }).finally(() => {
            redirect("/login")
        })
    }, [])

    return (
        <main className="flex min-h-screen items-center justify-center text-gray-500">
            Signing out...
        </main>
    )
}
