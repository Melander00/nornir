import { useState } from "react";
import { useUser } from "~/hooks/useUser";
import { SlidePanel } from "../sidebar/SlidePanel";

const links = [
    { label: "Home", href: "/" },
    { label: "Logs", href: "/logs" },
    { label: "Weekly", href: "/weekly" },
    { label: "Log out", href: "/logout" },
];

export default function Top() {
    const { user } = useUser();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-row justify-between items-center h-15 bg-indigo-700">
            <div
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="h-full p-2 cursor-pointer flex justify-center items-center text-white"
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
            </div>

            <SlidePanel
                id="mobile-navigation"
                open={isOpen}
                onClose={() => setIsOpen(false)}
                side="left"
                width="min(18rem, 85vw)"
                duration={250}
                title={
                    <div className="flex flex-row h-10 items-center gap-[10px]">
                        <img className="h-full rounded-full" src="/nornir.png" />
                        Nornir
                    </div>
                }
                showCloseButton
            >
                <nav className="p-4">
                    <ul className="space-y-2">
                        {links.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </SlidePanel>

            <div className="h-full p-2 cursor-pointer flex justify-center items-center">
                <img className="h-full rounded-full" src={user?.picture} />
            </div>
        </div>
    );
}

function ProfileModal() {}
