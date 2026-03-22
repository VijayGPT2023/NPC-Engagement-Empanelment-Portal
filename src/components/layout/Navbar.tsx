"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, User, LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/i18n";

interface NavUser {
  name: string;
  role: string;
  email: string;
}

interface NavbarProps {
  user: NavUser | null;
}

const roleLinks: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/requirements", label: "Requirements" },
    { href: "/admin/applications", label: "Applications" },
    { href: "/admin/screening", label: "Screening" },
  ],
  applicant: [
    { href: "/applicant/applications", label: "My Applications" },
    { href: "/applicant/engagement", label: "Engagement" },
    { href: "/applicant/empanelment", label: "Empanelment" },
  ],
};

export default function Navbar({ user }: NavbarProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = user ? roleLinks[user.role] ?? [] : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900 bg-blue-900 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-wide text-white">
              {t("common.orgName")}
            </span>
            <span className="text-xs text-blue-200">
              {t("common.appName")}
            </span>
          </Link>
        </div>

        {/* Nav links + user menu */}
        <div className="flex items-center gap-6">
          {/* Navigation links */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link
              href="/information"
              className="rounded px-3 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-800 hover:text-white"
            >
              Information
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* User menu */}
          {user && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-blue-100 transition-colors hover:bg-blue-800 hover:text-white"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <p className="text-sm font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    {t("common.profile")}
                  </Link>
                  <Link
                    href="/auth/logout"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("common.logout")}
                  </Link>
                </div>
              )}
            </div>
          )}

          {!user && (
            <Link
              href="/auth/login"
              className="rounded bg-white px-4 py-2 text-sm font-medium text-blue-900 transition-colors hover:bg-blue-50"
            >
              {t("common.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
