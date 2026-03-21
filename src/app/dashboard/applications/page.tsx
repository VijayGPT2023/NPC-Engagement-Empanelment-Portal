"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import { ENGAGEMENT_STATUSES, EMPANELMENT_STATUSES } from "@/lib/constants";

type Tab = "engagement" | "empanelment";

function statusLabel(status: string, type: Tab): string {
  const list = type === "engagement" ? ENGAGEMENT_STATUSES : EMPANELMENT_STATUSES;
  return list.find((s) => s.code === status)?.name ?? status;
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("engagement");
  const [engApps, setEngApps] = useState<Record<string, unknown>[]>([]);
  const [empApps, setEmpApps] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [engRes, empRes] = await Promise.all([
          fetch("/api/applications/engagement", { headers }),
          fetch("/api/applications/empanelment", { headers }),
        ]);
        if (engRes.ok) {
          const d = await engRes.json();
          setEngApps(Array.isArray(d) ? d : d.applications || []);
        }
        if (empRes.ok) {
          const d = await empRes.json();
          setEmpApps(Array.isArray(d) ? d : d.applications || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const engColumns = [
    { key: "applicationNo", label: "Application No", sortable: true },
    { key: "postAppliedFor", label: "Post Applied For", sortable: true },
    {
      key: "submittedAt",
      label: "Date",
      sortable: true,
      render: (v: unknown) => v ? new Date(String(v)).toLocaleDateString("en-IN") : "—",
    },
    {
      key: "autoScreenScore",
      label: "Score",
      sortable: true,
      render: (v: unknown) => v != null ? `${v}%` : "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v: unknown) => <Badge status={String(v)} label={statusLabel(String(v), "engagement")} />,
    },
  ];

  const empColumns = [
    { key: "applicationNo", label: "Application No", sortable: true },
    { key: "categoryApplied", label: "Category", sortable: true },
    { key: "domains", label: "Domain(s)", sortable: false },
    {
      key: "submittedAt",
      label: "Date",
      sortable: true,
      render: (v: unknown) => v ? new Date(String(v)).toLocaleDateString("en-IN") : "—",
    },
    {
      key: "autoScreenScore",
      label: "Score",
      sortable: true,
      render: (v: unknown) => v != null ? `${v}%` : "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v: unknown) => <Badge status={String(v)} label={statusLabel(String(v), "empanelment")} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => router.push("/apply/engagement")}>
            New Engagement
          </Button>
          <Button variant="secondary" size="sm" onClick={() => router.push("/apply/empanelment")}>
            New Empanelment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(["engagement", "empanelment"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t} Applications ({t === "engagement" ? engApps.length : empApps.length})
            </button>
          ))}
        </nav>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <DataTable
            columns={tab === "engagement" ? engColumns : empColumns}
            data={tab === "engagement" ? engApps : empApps}
            onRowClick={(row) => router.push(`/dashboard/applications/${row.id}?type=${tab}`)}
            pageSize={10}
          />
        )}
      </Card>
    </div>
  );
}
