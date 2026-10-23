import { NavLinks } from "./NavLinks";

// Always-visible navigation for wide screens. The caller decides when it is
// shown, e.g. className="hidden md:flex".
export function Sidebar({ className = "" }: { className?: string }) {
    return (
        <aside
            className={[
                "sticky top-0 h-dvh w-64 shrink-0 flex-col overflow-y-auto",
                "border-r border-gray-200 bg-white",
                className,
            ].join(" ")}
        >
            <div className="flex h-15 shrink-0 flex-row items-center gap-[10px] border-b border-gray-200 px-4 text-lg font-semibold">
                <img className="h-10 rounded-full" src="/nornir.png" alt="" />
                Nornir
            </div>

            <NavLinks />
        </aside>
    );
}
