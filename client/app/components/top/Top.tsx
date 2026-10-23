import { useState } from "react";
import { Link } from "react-router";
import { useUser } from "~/hooks/useUser";
import { NavLinks } from "../sidebar/NavLinks";
import { SlidePanel } from "../sidebar/SlidePanel";

export default function Top() {
    const { user } = useUser();

    const [isOpen, setIsOpen] = useState(false);

    const displayName = user?.name ?? user?.username ?? "";

    return (
        <div className="flex flex-row justify-between items-center h-15 shrink-0 bg-indigo-700">
            {/* On desktop the Sidebar replaces the hamburger and drawer. */}
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
                aria-label="Open navigation"
                onClick={() => setIsOpen(true)}
                className="h-full p-2 cursor-pointer flex justify-center items-center text-white md:hidden"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <Link to="/" className="text-lg font-semibold text-white md:hidden">
                Nornir
            </Link>

            <SlidePanel
                id="mobile-navigation"
                open={isOpen}
                onClose={() => setIsOpen(false)}
                side="left"
                width="min(18rem, 85vw)"
                duration={250}
                // Never leave a drawer or overlay behind if the window is widened.
                panelClassName="md:hidden"
                overlayClassName="md:hidden"
                title={
                    <div className="flex flex-row h-10 items-center gap-[10px]">
                        <img className="h-full rounded-full" src="/nornir.png" alt="" />
                        Nornir
                    </div>
                }
                showCloseButton
            >
                <NavLinks onNavigate={() => setIsOpen(false)} />
            </SlidePanel>

            <div className="ml-auto h-full p-2 flex justify-center items-center">
                {user?.picture ? (
                    <img className="h-full rounded-full" src={user.picture} alt={displayName} />
                ) : (
                    <span className="flex aspect-square h-full items-center justify-center rounded-full bg-indigo-500 font-medium text-white">
                        {displayName.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
        </div>
    );
}

function ProfileModal() {}
