import { redirect } from "~/lib/redirect";

export default function LoginPage() {
    function login() {
        redirect("/api/auth/login");
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-xl p-8 shadow-md bg-gray-50">
                <h1 className="mb-2 text-center text-2xl font-bold text-white-900">Welcome back</h1>

                <p className="mb-6 text-center text-sm text-gray-500">Sign in with your GitLab account</p>

                <button
                    onClick={login}
                    className={`
w-full
flex flex-row justify-center gap-10 items-center
border-[#FC6D26] border-4 rounded-lg
p-4
cursor-pointer
`}
                    // className="w-full flex flex-row justify-center gap-10 items-center rounded-lg border-[#FC6D26] border-px px-4 py-3 font-medium text-white transition hover:border-[#FC6D26] focus:outline-none focus:ring-2 focus:ring-[#FC6D26] focus:ring-offset-2"
                >
                    <img src="/gitlab-vicke.png" className="w-2/10" />
                    Sign in with GitLab
                </button>
            </div>
        </main>
    );
}
