"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/attendance", label: "Attendance" },
  { href: "/students", label: "Students", adminOnly: true },
  { href: "/teachers", label: "Teachers", adminOnly: true },
  { href: "/logs", label: "Logs", adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const links = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 border-b border-dark-red/80 bg-maroon text-white">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/attendance" className="flex min-w-0 items-center gap-3">
          <Logo />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">Aunty Eve&apos;s Place</p>
            <p className="truncate text-[11px] text-white/70">Attendance</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 text-white/90 hover:bg-white/10 hover:text-white"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">{user.name.split(" ")[0]}</span>
            </Button>
          </nav>

          <button
            type="button"
            className="rounded-md p-2 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm",
                    pathname === item.href ? "bg-white/15" : "text-white/85",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-white/85"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
