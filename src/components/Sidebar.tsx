"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeNav: string;
}

const navItems = [
  { id: "ai", label: "AI", icon: "lucide:cpu", href: "/" },
  { id: "dashboard", label: "DASH", icon: "lucide:grid-3x3", href: "/dashboard" },
  { id: "ledger", label: "LOG", icon: "lucide:database", href: "/ledger" },
  { id: "targets", label: "GOALS", icon: "lucide:crosshair", href: "/targets" },
];

export default function Sidebar({ activeNav }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Top Navbar - Mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white h-14 flex items-center justify-between px-4">
        <Link href="/" className="font-black text-2xl text-[#00FFFF] tracking-tighter">
          FM
        </Link>
        <div className="flex items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`p-2 ${activeNav === item.id ? "text-[#00FFFF]" : "text-gray-500"}`}
            >
              <iconify-icon icon={item.icon} class="text-xl" />
            </Link>
          ))}
          {user ? (
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500">
              <iconify-icon icon="lucide:log-out" class="text-xl" />
            </button>
          ) : (
            <Link href="/login" className="p-2 text-gray-500 hover:text-[#00FFFF]">
              <iconify-icon icon="lucide:log-in" class="text-xl" />
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 border-r-2 border-white flex-col h-screen sticky top-0 bg-black shrink-0">
        {/* Logo */}
        <Link href="/" className="block p-8 border-b-2 border-white bg-[#00FFFF] text-black">
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            FIN
            <br />
            MATE
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col flex-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`
                px-8 py-6 border-b-2 border-white font-bold flex items-center gap-4 text-2xl
                ${
                  activeNav === item.id
                    ? "bg-white text-black"
                    : "bg-black text-gray-500 hover:bg-white hover:text-black"
                }
              `}
            >
              <iconify-icon icon={item.icon} class="text-3xl" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t-2 border-white">
          {user ? (
            <div className="p-6">
              <p className="font-mono text-sm text-gray-500">USER</p>
              <p className="font-mono text-lg text-white font-bold truncate">{user.name}</p>
              <p className="font-mono text-xs text-gray-600 truncate mb-4">{user.email}</p>
              <button
                onClick={logout}
                className="w-full border-2 border-gray-700 bg-[#0a0a0a] text-gray-400 hover:text-red-500 hover:border-red-500 p-3 font-mono text-sm transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="border-2 border-[#00FFFF] bg-[#00FFFF] text-black text-center py-3 font-bold text-sm hover:bg-white transition-colors"
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                className="border-2 border-gray-700 text-gray-400 text-center py-3 font-mono text-sm hover:border-white hover:text-white transition-colors"
              >
                REGISTER
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
