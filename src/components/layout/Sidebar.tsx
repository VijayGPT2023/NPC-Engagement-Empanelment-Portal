"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  ScanSearch,
  Activity,
  Settings,
  Briefcase,
  Award,
  UserCircle,
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: string;
  activePath: string;
}

const adminItems: SidebarItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/admin/posts",
    label: "Post Requirements",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/admin/screening",
    label: "Screening",
    icon: <ScanSearch className="h-5 w-5" />,
  },
  {
    href: "/admin/tracking",
    label: "Status Tracking",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    href: "/admin/posts/create",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const applicantItems: SidebarItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/applications",
    label: "My Applications",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/apply/engagement",
    label: "Apply for Engagement",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    href: "/apply/empanelment",
    label: "Apply for Empanelment",
    icon: <Award className="h-5 w-5" />,
  },
  {
    href: "/dashboard/profile",
    label: "My Profile",
    icon: <UserCircle className="h-5 w-5" />,
  },
];

export default function Sidebar({ role, activePath }: SidebarProps) {
  const items = role === "admin" ? adminItems : applicantItems;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
