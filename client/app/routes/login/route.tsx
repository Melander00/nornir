import { useState } from "react";
import { redirect } from "~/lib/redirect";

export default function LoginPage() {
    const [isRedirecting, setIsRedirecting] = useState(false);

    function login() {
        setIsRedirecting(true);
        redirect("/api/auth/login");
    }

    return (
        <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-indigo-50 via-white to-indigo-100 p-4">
            <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <img src="/nornir.png" alt="" className="mb-4 h-20 w-20 rounded-full shadow-md" />

                <h1 className="text-3xl font-bold text-gray-900">Nornir</h1>
                <p className="mt-1 mb-8 text-center text-sm text-gray-500">Time reporting for your project group</p>

                <button
                    type="button"
                    onClick={login}
                    disabled={isRedirecting}
                    className={[
                        "flex w-full flex-row items-center justify-center gap-3",
                        "rounded-lg border-2 border-[#FC6D26] bg-white px-4 py-3",
                        "font-medium text-gray-900 shadow-sm transition",
                        "cursor-pointer hover:bg-[#FC6D26]/10 active:scale-[0.98]",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FC6D26]/40",
                        "disabled:cursor-wait disabled:opacity-70",
                    ].join(" ")}
                >
                    <img src="/gitlab-vicke.png" alt="" className="h-7 w-7 object-contain" />
                    {isRedirecting ? "Redirecting..." : "Sign in with GitLab"}
                </button>

                <p className="mt-6 text-center text-xs text-gray-400">You will be sent to GitLab to sign in.</p>
            </div>
        </main>
    );
}
