"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  activeNav: string;
}

const navItems = [
  { id: "ai", label: "AI", icon: "lucide:sparkles", href: "/" },
  { id: "dashboard", label: "Dashboard", icon: "lucide:layout-dashboard", href: "/dashboard" },
  { id: "ledger", label: "Ledger", icon: "lucide:book-open", href: "/ledger" },
  { id: "targets", label: "Targets", icon: "lucide:target", href: "/targets" },
];

export default function Sidebar({ activeNav }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[280px] z-40 flex-col">
        <div className="flex flex-col h-full m-4 rounded-[2rem] overflow-hidden glass-card border border-white/[0.06]">
          {/* Logo */}
          <Link href="/" className="block px-8 py-7 border-b border-white/[0.06]">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              FIN<span className="text-[var(--cyan)]">MATE</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-1">Financial Intelligence</p>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col flex-1 px-3 py-4 gap-1">
            {navItems.map((item, i) => (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium
                  transition-all duration-500 ease-[var(--ease-fluid)]
                  animate-slide-in-left
                  ${activeNav === item.id
                    ? "bg-white/[0.08] text-white border border-white/[0.06]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                  }
                `}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <iconify-icon
                  icon={item.icon}
                  class={`text-lg transition-colors duration-300 ${
                    activeNav === item.id ? "text-[var(--cyan)]" : ""
                  }`}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="px-4 pb-4">
            {user ? (
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--cyan)]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-white/30 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-center py-2 rounded-xl text-xs text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="text-center py-3 rounded-2xl bg-white/[0.06] border border-white/[0.06] text-sm font-medium text-white hover:bg-white/[0.1] transition-all duration-500 ease-[var(--ease-fluid)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-center py-3 rounded-2xl text-sm text-white/30 hover:text-white/60 transition-colors duration-300"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Floating Nav Pill */}
      <nav className={`
        md:hidden fixed top-4 left-4 right-4 z-50
        transition-all duration-700 ease-[var(--ease-fluid)]
        ${scrolled ? "mt-0" : "mt-0"}
      `}>
        <div className="flex items-center justify-between px-5 py-3 rounded-full glass-card border border-white/[0.08] backdrop-blur-3xl">
          <Link href="/" className="text-lg font-bold text-white tracking-tight">
            FIN<span className="text-[var(--cyan)]">MATE</span>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5 items-center">
              <span className={`
                block w-5 h-[1.5px] bg-white rounded-full
                transition-all duration-500 ease-[var(--ease-fluid)]
                ${mobileOpen ? "translate-y-[4.5px] rotate-45" : ""}
              `} />
              <span className={`
                block w-5 h-[1.5px] bg-white rounded-full
                transition-all duration-500 ease-[var(--ease-fluid)]
                ${mobileOpen ? "opacity-0 scale-0" : ""}
              `} />
              <span className={`
                block w-5 h-[1.5px] bg-white rounded-full
                transition-all duration-500 ease-[var(--ease-fluid)]
                ${mobileOpen ? "-translate-y-[4.5px] -rotate-45" : ""}
              `} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <div className={`
        md:hidden fixed inset-0 z-40
        transition-all duration-700 ease-[var(--ease-fluid)]
        ${mobileOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
        }
      `}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu Content */}
        <div className={`
          absolute inset-0 flex flex-col items-center justify-center
          transition-all duration-700 ease-[var(--ease-fluid)]
          ${mobileOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}
        `}>
          <nav className="flex flex-col items-center gap-2">
            {navItems.map((item, i) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-8 py-4 rounded-2xl text-2xl font-medium
                  transition-all duration-500 ease-[var(--ease-fluid)]
                  ${activeNav === item.id
                    ? "text-white bg-white/[0.06]"
                    : "text-white/40 hover:text-white"
                  }
                `}
                style={{
                  transitionDelay: mobileOpen ? `${150 + i * 75}ms` : "0ms",
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(16px)",
                }}
              >
                <iconify-icon icon={item.icon} class="text-xl" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-12 flex flex-col items-center gap-4">
            {user ? (
              <>
                <p className="text-sm text-white/30">{user.name}</p>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-sm text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="px-8 py-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
