"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ArrowUpDown,
  Filter,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

interface PostStats {
  total: number;
  active: number;
  closed: number;
}

interface EngagementStats {
  total: number;
  submitted: number;
  under_screening: number;
  shortlisted: number;
  selected: number;
  rejected: number;
}

interface EmpanelmentStats {
  total: number;
  submitted: number;
  under_screening: number;
  shortlisted: number;
  empanelled: number;
}

interface PostWiseItem {
  id: string;
  advertisementNo: string;
  title: string;
  domain: string;
  placeOfDeployment: string;
  applicationDeadline: string;
  status: string;
  applicationCounts: {
    total: number;
    submitted: number;
    under_screening: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
}

interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
}

interface EmpanelmentListItem {
  id: string;
  applicationNo: string;
  fullName: string;
  categoryApplied: string;
  domains: string;
  status: string;
  autoScreenScore: number | null;
}

interface StatsData {
  posts: PostStats;
  engagementApplications: EngagementStats;
  empanelmentApplications: EmpanelmentStats;
  postWise: PostWiseItem[];
  recentActivity: ActivityItem[];
  empanelmentList: EmpanelmentListItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_screening: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-indigo-100 text-indigo-800",
  selected: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  empanelled: "bg-emerald-100 text-emerald-800",
  interview_scheduled: "bg-purple-100 text-purple-800",
};

function StatusBadge({ status, count }: { status: string; count: number }) {
  if (count === 0) return <span className="text-gray-300">0</span>;
  const color = statusColors[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {count}
    </span>
  );
}

function formatLabel(s: string) {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Component ────────────────────────────────────────────────────

export default function TrackingPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Empanelment filters
  const [empStatusFilter, setEmpStatusFilter] = useState("all");
  const [empCategoryFilter, setEmpCategoryFilter] = useState("all");
  const [empSearch, setEmpSearch] = useState("");

  // Post table sort
  const [sortField, setSortField] = useState<"deadline" | "total">("deadline");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sorted post-wise data
  const sortedPosts = useMemo(() => {
    if (!data) return [];
    const arr = [...data.postWise];
    arr.sort((a, b) => {
      if (sortField === "deadline") {
        const da = new Date(a.applicationDeadline).getTime();
        const db = new Date(b.applicationDeadline).getTime();
        return sortAsc ? da - db : db - da;
      }
      return sortAsc
        ? a.applicationCounts.total - b.applicationCounts.total
        : b.applicationCounts.total - a.applicationCounts.total;
    });
    return arr;
  }, [data, sortField, sortAsc]);

  // Filtered empanelment list
  const filteredEmpanelment = useMemo(() => {
    if (!data) return [];
    return data.empanelmentList.filter((item) => {
      if (empStatusFilter !== "all" && item.status !== empStatusFilter)
        return false;
      if (
        empCategoryFilter !== "all" &&
        item.categoryApplied !== empCategoryFilter
      )
        return false;
      if (
        empSearch &&
        !item.fullName.toLowerCase().includes(empSearch.toLowerCase()) &&
        !item.applicationNo.toLowerCase().includes(empSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, empStatusFilter, empCategoryFilter, empSearch]);

  const empCategories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.empanelmentList.map((i) => i.categoryApplied))];
  }, [data]);

  const empStatuses = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.empanelmentList.map((i) => i.status))];
  }, [data]);

  const toggleSort = (field: "deadline" | "total") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of all posts and applications at a glance.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ── Overview Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Posts */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.posts.active}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {data.posts.total} total &middot; {data.posts.closed} closed
          </p>
        </div>

        {/* Total Applications */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementApplications.total +
                  data.empanelmentApplications.total}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {data.engagementApplications.total} engagement &middot;{" "}
            {data.empanelmentApplications.total} empanelment
          </p>
        </div>

        {/* Selected / Empanelled */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selected / Empanelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementApplications.selected +
                  data.empanelmentApplications.empanelled}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {data.engagementApplications.selected} selected &middot;{" "}
            {data.empanelmentApplications.empanelled} empanelled
          </p>
        </div>

        {/* Rejected */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementApplications.rejected}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">engagement applications</p>
        </div>
      </div>

      {/* ── Application Status Breakdown ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Engagement breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Engagement Applications by Status
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["submitted", "bg-blue-500"],
                ["under_screening", "bg-yellow-500"],
                ["shortlisted", "bg-indigo-500"],
                ["selected", "bg-green-500"],
                ["rejected", "bg-red-500"],
              ] as [keyof EngagementStats, string][]
            ).map(([key, color]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
              >
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {data.engagementApplications[key]}
                  </p>
                  <p className="text-xs text-gray-500">{formatLabel(key)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empanelment breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Empanelment Applications by Status
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(
              [
                ["submitted", "bg-blue-500"],
                ["under_screening", "bg-yellow-500"],
                ["shortlisted", "bg-indigo-500"],
                ["empanelled", "bg-emerald-500"],
              ] as [keyof EmpanelmentStats, string][]
            ).map(([key, color]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
              >
                <div className={`h-3 w-3 rounded-full ${color}`} />
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {data.empanelmentApplications[key]}
                  </p>
                  <p className="text-xs text-gray-500">{formatLabel(key)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Post-wise Status Table ───────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Post-wise Application Status
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Adv No</th>
                <th className="px-4 py-3">Post Title</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Location</th>
                <th
                  className="cursor-pointer px-4 py-3"
                  onClick={() => toggleSort("deadline")}
                >
                  <span className="inline-flex items-center gap-1">
                    Deadline
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center"
                  onClick={() => toggleSort("total")}
                >
                  <span className="inline-flex items-center gap-1">
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3 text-center">Submitted</th>
                <th className="px-4 py-3 text-center">Screened</th>
                <th className="px-4 py-3 text-center">Shortlisted</th>
                <th className="px-4 py-3 text-center">Selected</th>
                <th className="px-4 py-3 text-center">Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedPosts.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No posts found.
                  </td>
                </tr>
              ) : (
                sortedPosts.map((post) => {
                  const deadline = new Date(post.applicationDeadline);
                  const isPast = deadline < now;
                  return (
                    <tr
                      key={post.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => router.push(`/admin/posts/${post.id}`)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {post.advertisementNo}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-700">
                        {post.title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {post.domain}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {post.placeOfDeployment}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`text-sm font-medium ${
                            isPast ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {deadline.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">
                        {post.applicationCounts.total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status="submitted"
                          count={post.applicationCounts.submitted}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status="under_screening"
                          count={post.applicationCounts.under_screening}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status="shortlisted"
                          count={post.applicationCounts.shortlisted}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status="selected"
                          count={post.applicationCounts.selected}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge
                          status="rejected"
                          count={post.applicationCounts.rejected}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Timeline / Activity Feed ─────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No recent activity.
            </div>
          ) : (
            data.recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 px-5 py-3"
              >
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {timeAgo(activity.timestamp)} &middot;{" "}
                    {new Date(activity.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[
                      activity.type.replace("application_", "").replace("empanelment_", "")
                    ] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formatLabel(
                    activity.type
                      .replace("application_", "")
                      .replace("empanelment_", "")
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Empanelment Tracking Table ───────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Empanelment Applications Tracking
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Filters:</span>
          </div>
          <select
            value={empStatusFilter}
            onChange={(e) => setEmpStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {empStatuses.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>
          <select
            value={empCategoryFilter}
            onChange={(e) => setEmpCategoryFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {empCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or app no..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">App No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmpanelment.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No empanelment applications found.
                  </td>
                </tr>
              ) : (
                filteredEmpanelment.map((app) => (
                  <tr
                    key={app.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {app.applicationNo}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{app.fullName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {app.categoryApplied}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.domains}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[app.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {app.autoScreenScore != null ? (
                        <span className="font-medium text-gray-900">
                          {app.autoScreenScore}%
                        </span>
                      ) : (
                        <span className="text-gray-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
