import { NavLink } from "react-router";
import { useUser } from "~/hooks/useUser";

const links = [
    { label: "Home", href: "/" },
    { label: "Logs", href: "/logs" },
    { label: "Weekly", href: "/weekly" },
    { label: "Log out", href: "/logout" },
];

// Shared by the mobile drawer and the desktop sidebar.
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    const { user } = useUser();

    const displayName = user?.name ?? user?.username ?? "";

    return (
        <>
            <nav className="p-4">
                <ul className="space-y-2">
                    {links.map((link) => (
                        <li key={link.href}>
                            <NavLink
                                to={link.href}
                                end
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    [
                                        "block rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 hover:text-black",
                                        isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-700",
                                    ].join(" ")
                                }
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {displayName && <p className="px-8 text-sm text-gray-500">Signed in as {displayName}</p>}
        </>
    );
}
