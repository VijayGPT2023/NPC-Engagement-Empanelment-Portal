"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import {
  ENGAGEMENT_STATUSES,
  EMPANELMENT_STATUSES,
} from "@/lib/constants";
import {
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface Application {
  id: string;
  applicationNo: string;
  type: "engagement" | "empanelment";
  postTitle?: string;
  category?: string;
  createdAt: string;
  status: string;
}

interface DashboardStats {
  engagementCount: number;
  empanelmentCount: number;
  pendingCount: number;
  shortlistedCount: number;
}

function getStatusLabel(status: string, type: "engagement" | "empanelment"): string {
  const list = type === "engagement" ? ENGAGEMENT_STATUSES : EMPANELMENT_STATUSES;
  const found = list.find((s) => s.code === status);
  return found ? found.name : status;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    engagementCount: 0,
    empanelmentCount: 0,
    pendingCount: 0,
    shortlistedCount: 0,
  });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        setUserName(user.name || "Applicant");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [engRes, empRes] = await Promise.all([
          fetch("/api/applications/engagement", { headers }),
          fetch("/api/applications/empanelment", { headers }),
        ]);

        const engData = engRes.ok ? await engRes.json() : [];
        const empData = empRes.ok ? await empRes.json() : [];

        const engApps: Application[] = (Array.isArray(engData) ? engData : engData.applications || []).map(
          (a: Record<string, unknown>) => ({
            id: a.id,
            applicationNo: a.applicationNo || a.id,
            type: "engagement" as const,
            postTitle: a.postTitle || a.postAppliedFor || "N/A",
            createdAt: a.createdAt,
            status: a.status || "submitted",
          })
        );

        const empApps: Application[] = (Array.isArray(empData) ? empData : empData.applications || []).map(
          (a: Record<string, unknown>) => ({
            id: a.id,
            applicationNo: a.applicationNo || a.id,
            type: "empanelment" as const,
            category: a.category || "N/A",
            createdAt: a.createdAt,
            status: a.status || "submitted",
          })
        );

        const all = [...engApps, ...empApps];

        const pendingStatuses = ["submitted", "under_screening"];
        const shortlistedStatuses = ["shortlisted", "empanelled", "selected"];

        setStats({
          engagementCount: engApps.length,
          empanelmentCount: empApps.length,
          pendingCount: all.filter((a) => pendingStatuses.includes(a.status)).length,
          shortlistedCount: all.filter((a) => shortlistedStatuses.includes(a.status)).length,
        });

        // Sort by date desc and take top 5
        const sorted = all.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentApps(sorted.slice(0, 5));
      } catch {
        // API may not be available yet
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const summaryCards = [
    {
      label: "Engagement Applications",
      value: stats.engagementCount,
      icon: <Briefcase className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Empanelment Applications",
      value: stats.empanelmentCount,
      icon: <Award className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Pending",
      value: stats.pendingCount,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Shortlisted",
      value: stats.shortlistedCount,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bg: "bg-green-50",
    },
  ];

  const tableColumns = [
    { key: "applicationNo", label: "Application No", sortable: true },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (value: unknown) => (
        <span className="capitalize">{String(value)}</span>
      ),
    },
    {
      key: "postOrCategory",
      label: "Post / Category",
      sortable: false,
      render: (_: unknown, row: Record<string, unknown>) =>
        row.type === "engagement"
          ? String(row.postTitle || "N/A")
          : String(row.category || "N/A"),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return "\u2014";
        return new Date(String(value)).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => (
        <Badge
          status={String(value)}
          label={getStatusLabel(
            String(value),
            row.type as "engagement" | "empanelment"
          )}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {userName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here is an overview of your applications and quick actions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "\u2014" : card.value}
              </p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/apply/engagement"
            className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Apply for Engagement</p>
                <p className="text-sm text-gray-500">
                  Submit a new contractual engagement application
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
          </Link>

          <Link
            href="/apply/empanelment"
            className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Award className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Apply for Empanelment</p>
                <p className="text-sm text-gray-500">
                  Submit a new empanelment application
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-purple-600" />
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      <Card title="My Recent Applications">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-400">Loading applications...</p>
          </div>
        ) : recentApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-gray-400">
              No applications yet. Get started with a quick action above.
            </p>
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={recentApps as unknown as Record<string, unknown>[]}
            onRowClick={(row) =>
              router.push(`/dashboard/applications/${row.id}`)
            }
            pageSize={5}
          />
        )}
      </Card>
    </div>
  );
}
