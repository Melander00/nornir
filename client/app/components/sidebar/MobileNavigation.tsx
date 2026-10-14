
"use client";

import { useState } from "react";
import { SlidePanel } from "./SlidePanel";


const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Messages", href: "/messages" },
  { label: "Settings", href: "/settings" },
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b p-4">
        <span className="text-lg font-bold">My App</span>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label="Open navigation"
          className="rounded-lg p-2 hover:bg-gray-100"
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
      </header>

      <SlidePanel
        id="mobile-navigation"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        side="left"
        width="min(18rem, 85vw)"
        duration={250}
        title="Navigation"
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
    </>
  );
}
