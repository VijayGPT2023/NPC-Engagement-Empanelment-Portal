"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  FileText,
  ClipboardList,
  Users,
  ScanSearch,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalPosts: number;
  activePosts: number;
  totalEngagementApps: number;
  totalEmpanelmentApps: number;
  pendingScreening: number;
  shortlisted: number;
}

interface RecentApplication {
  id: string;
  applicationNo: string;
  fullName: string;
  type: string;
  postTitle?: string;
  category?: string;
  submittedAt: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        // Fetch posts stats
        const [postsAllRes, postsActiveRes, engAppsRes, empAppsRes] =
          await Promise.all([
            fetch("/api/posts?status=active&limit=1"),
            fetch("/api/posts?status=active&limit=1"),
            fetch("/api/applications/engagement?limit=1"),
            fetch("/api/applications/empanelment?limit=1"),
          ]);

        const postsAll = await postsAllRes.json();
        const postsActive = await postsActiveRes.json();
        const engApps = await engAppsRes.json();
        const empApps = await empAppsRes.json();

        // Calculate stats from available data
        const totalPosts = postsAll.pagination?.total ?? 0;
        const activePosts = postsActive.pagination?.total ?? 0;
        const totalEngagement = engApps.pagination?.total ?? 0;
        const totalEmpanelment = empApps.pagination?.total ?? 0;

        // Fetch screened/shortlisted counts
        const [engPendingRes, engShortRes] = await Promise.all([
          fetch("/api/applications/engagement?status=submitted&limit=1"),
          fetch("/api/applications/engagement?status=shortlisted&limit=1"),
        ]);
        const engPending = await engPendingRes.json();
        const engShort = await engShortRes.json();

        setStats({
          totalPosts,
          activePosts,
          totalEngagementApps: totalEngagement,
          totalEmpanelmentApps: totalEmpanelment,
          pendingScreening: engPending.pagination?.total ?? 0,
          shortlisted: engShort.pagination?.total ?? 0,
        });

        // Fetch recent applications (last 10)
        const [recentEngRes, recentEmpRes] = await Promise.all([
          fetch("/api/applications/engagement?limit=5"),
          fetch("/api/applications/empanelment?limit=5"),
        ]);
        const recentEng = await recentEngRes.json();
        const recentEmp = await recentEmpRes.json();

        const combined: RecentApplication[] = [
          ...(recentEng.applications || []).map(
            (a: Record<string, unknown>) => ({
              id: a.id,
              applicationNo: a.applicationNo,
              fullName: a.fullName,
              type: "Engagement",
              postTitle: (a.postRequirement as Record<string, unknown>)
                ?.title as string,
              submittedAt: a.submittedAt,
              status: a.status,
            })
          ),
          ...(recentEmp.applications || []).map(
            (a: Record<string, unknown>) => ({
              id: a.id,
              applicationNo: a.applicationNo,
              fullName: a.fullName,
              type: "Empanelment",
              category: a.categoryApplied,
              submittedAt: a.submittedAt,
              status: a.status,
            })
          ),
        ];

        // Sort by submitted date descending, take 10
        combined.sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );
        setRecentApps(combined.slice(0, 10));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Posts",
      value: stats?.totalPosts ?? 0,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Active Posts",
      value: stats?.activePosts ?? 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Engagement Applications",
      value: stats?.totalEngagementApps ?? 0,
      icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Empanelment Applications",
      value: stats?.totalEmpanelmentApps ?? 0,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Pending Screening",
      value: stats?.pendingScreening ?? 0,
      icon: <ScanSearch className="h-6 w-6 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Shortlisted",
      value: stats?.shortlisted ?? 0,
      icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`rounded-lg p-3 ${card.bg}`}>{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/admin/posts/create")}>
            Create Post
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/screening")}
          >
            Run Screening
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/applications")}
          >
            View Applications
          </Button>
        </div>
      </Card>

      {/* Recent Applications Table */}
      <Card title="Recent Applications">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  App No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Post / Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentApps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No recent applications found.
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => (
                  <tr
                    key={app.id}
                    className="cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => router.push("/admin/applications")}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {app.applicationNo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {app.fullName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge
                        label={app.type}
                        status={
                          app.type === "Engagement" ? "submitted" : "empanelled"
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {app.postTitle || app.category || "\u2014"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString("en-IN")
                        : "\u2014"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge
                        label={app.status.replace(/_/g, " ")}
                        status={app.status}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
