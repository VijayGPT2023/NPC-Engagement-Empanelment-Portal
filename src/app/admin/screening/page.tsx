"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import { AlertCircle, Download, ScanSearch, CheckCircle } from "lucide-react";

type ScreeningTab = "engagement" | "empanelment";

interface ScreenedApp {
  id: string;
  applicationNo: string;
  fullName: string;
  autoScreenScore: number | null;
  autoScreenResult: string | null;
  autoScreenDetails: string | null;
  status: string;
}

interface ScreeningDetail {
  criterion: string;
  passed: boolean;
  score: number;
  maxScore: number;
  remarks: string;
}

interface ScreeningSummary {
  total: number;
  eligible: number;
  notEligible: number;
  needsReview: number;
}

export default function ScreeningDashboard() {
  const searchParams = useSearchParams();
  const paramType = searchParams.get("type") as ScreeningTab | null;
  const paramAppId = searchParams.get("applicationId");

  const [activeTab, setActiveTab] = useState<ScreeningTab>(
    paramType || "engagement"
  );
  const [apps, setApps] = useState<ScreenedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<ScreeningSummary>({
    total: 0,
    eligible: 0,
    notEligible: 0,
    needsReview: 0,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ScreenedApp | null>(null);
  const [details, setDetails] = useState<ScreeningDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Override state
  const [overrideResult, setOverrideResult] = useState("");
  const [overrideRemarks, setOverrideRemarks] = useState("");
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  // Bulk screening
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchScreenedApps = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        activeTab === "engagement"
          ? "/api/applications/engagement?limit=200"
          : "/api/applications/empanelment?limit=200";

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      const allApps: ScreenedApp[] = (data.applications || []).map(
        (a: Record<string, unknown>) => ({
          id: a.id,
          applicationNo: a.applicationNo,
          fullName: a.fullName,
          autoScreenScore: a.autoScreenScore,
          autoScreenResult: a.autoScreenResult,
          autoScreenDetails: a.autoScreenDetails,
          status: a.status,
        })
      );

      setApps(allApps);

      // Compute summary from screened apps
      const screened = allApps.filter((a) => a.autoScreenResult !== null);
      setSummary({
        total: screened.length,
        eligible: screened.filter((a) => a.autoScreenResult === "eligible")
          .length,
        notEligible: screened.filter(
          (a) => a.autoScreenResult === "not_eligible"
        ).length,
        needsReview: screened.filter(
          (a) =>
            a.autoScreenResult === "needs_review" ||
            a.autoScreenResult === "review"
        ).length,
      });
    } catch (err) {
      console.error("Fetch screened apps error:", err);
      setError("Failed to load screening data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchScreenedApps();
  }, [fetchScreenedApps]);

  // Open details modal if applicationId is in URL params
  useEffect(() => {
    if (paramAppId && apps.length > 0) {
      const app = apps.find((a) => a.id === paramAppId);
      if (app) {
        handleViewDetails(app);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramAppId, apps]);

  const handleViewDetails = async (app: ScreenedApp) => {
    setSelectedApp(app);
    setModalOpen(true);
    setOverrideResult("");
    setOverrideRemarks("");

    if (app.autoScreenDetails) {
      try {
        const parsed = JSON.parse(app.autoScreenDetails);
        setDetails(Array.isArray(parsed) ? parsed : []);
      } catch {
        setDetails([]);
      }
      return;
    }

    // Fetch from API
    try {
      setDetailsLoading(true);
      const res = await fetch(
        `/api/screening?applicationId=${app.id}&type=${activeTab}`
      );
      if (!res.ok) throw new Error("Failed to fetch screening details");
      const data = await res.json();
      const screeningDetails = data.screening?.autoScreenDetails;
      setDetails(
        Array.isArray(screeningDetails) ? screeningDetails : []
      );
    } catch (err) {
      console.error("Fetch details error:", err);
      setDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!selectedApp || !overrideResult) return;

    try {
      setOverrideSubmitting(true);
      const endpoint =
        activeTab === "engagement"
          ? `/api/applications/engagement`
          : `/api/applications/empanelment`;

      // Update the application status based on override
      const newStatus =
        overrideResult === "eligible" ? "shortlisted" : "rejected";

      const res = await fetch(`${endpoint}/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          manualReviewRemarks: overrideRemarks,
          manualReviewResult: overrideResult,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to override screening decision.");
        return;
      }

      setModalOpen(false);
      fetchScreenedApps();
    } catch (err) {
      console.error("Override error:", err);
      alert("Failed to override. Please try again.");
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const handleRunAllPending = async () => {
    try {
      setBulkLoading(true);
      const pendingApps = apps.filter(
        (a) => a.autoScreenResult === null && a.status === "submitted"
      );

      if (pendingApps.length === 0) {
        alert("No pending applications to screen.");
        return;
      }

      let screened = 0;
      for (const app of pendingApps) {
        try {
          await fetch("/api/screening", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicationId: app.id,
              type: activeTab,
            }),
          });
          screened++;
        } catch {
          // Continue with next app
        }
      }

      alert(`Screening completed for ${screened} of ${pendingApps.length} application(s).`);
      fetchScreenedApps();
    } catch (err) {
      console.error("Bulk screening error:", err);
      alert("Error running bulk screening. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    const screenedApps = apps.filter((a) => a.autoScreenResult !== null);
    if (screenedApps.length === 0) {
      alert("No screened data to export.");
      return;
    }

    const headers = [
      "Application No",
      "Name",
      "Score",
      "Result",
      "Status",
    ];
    const rows = screenedApps.map((a) => [
      a.applicationNo,
      a.fullName,
      a.autoScreenScore !== null ? String(a.autoScreenScore) : "",
      a.autoScreenResult || "",
      a.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `screening_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "applicationNo", label: "App No", sortable: true },
    { key: "fullName", label: "Name", sortable: true },
    {
      key: "autoScreenScore",
      label: "Score",
      sortable: true,
      render: (value: unknown) =>
        value !== null && value !== undefined
          ? `${value}%`
          : "\u2014",
    },
    {
      key: "autoScreenResult",
      label: "Result",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return <Badge label="Not Screened" status="draft" />;
        const result = value as string;
        const statusMap: Record<string, string> = {
          eligible: "approved",
          not_eligible: "rejected",
          needs_review: "under_review",
          review: "under_review",
        };
        return (
          <Badge
            label={result.replace(/_/g, " ")}
            status={statusMap[result] || "draft"}
          />
        );
      },
    },
    {
      key: "status",
      label: "App Status",
      sortable: true,
      render: (value: unknown) => (
        <Badge
          label={(value as string).replace(/_/g, " ")}
          status={value as string}
        />
      ),
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_value: unknown, row: Record<string, unknown>) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row as unknown as ScreenedApp);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  const tabs: { key: ScreeningTab; label: string }[] = [
    { key: "engagement", label: "Engagement Screening" },
    { key: "empanelment", label: "Empanelment Screening" },
  ];

  const summaryCards = [
    {
      label: "Total Screened",
      value: summary.total,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Eligible",
      value: summary.eligible,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Not Eligible",
      value: summary.notEligible,
      color: "text-red-700",
      bg: "bg-red-50",
    },
    {
      label: "Needs Review",
      value: summary.needsReview,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Screening Dashboard
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button loading={bulkLoading} onClick={handleRunAllPending}>
            <ScanSearch className="h-4 w-4" />
            Run Screening for All Pending
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border border-gray-200 p-4 ${card.bg}`}
          >
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`
              rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${
                activeTab === tab.key
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={apps as unknown as Record<string, unknown>[]}
            pageSize={10}
          />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Screening Details - ${selectedApp?.applicationNo || ""}`}
        size="lg"
      >
        {detailsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Applicant Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedApp?.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-2xl font-bold text-blue-700">
                  {selectedApp?.autoScreenScore !== null &&
                  selectedApp?.autoScreenScore !== undefined
                    ? `${selectedApp.autoScreenScore}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Result Badge */}
            {selectedApp?.autoScreenResult && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Auto-Screen Result:</span>
                <Badge
                  label={selectedApp.autoScreenResult.replace(/_/g, " ")}
                  status={
                    selectedApp.autoScreenResult === "eligible"
                      ? "approved"
                      : selectedApp.autoScreenResult === "not_eligible"
                      ? "rejected"
                      : "under_review"
                  }
                  size="md"
                />
              </div>
            )}

            {/* Screening Breakdown */}
            {details.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">
                  Screening Breakdown
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          Criterion
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                          Passed
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">
                          Score
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {details.map((d, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {d.criterion}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {d.passed ? (
                              <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="mx-auto h-5 w-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-700">
                            {d.score}/{d.maxScore}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {d.remarks || "\u2014"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {details.length === 0 && !detailsLoading && (
              <p className="text-sm text-gray-400">
                No screening breakdown available. Run screening first.
              </p>
            )}

            {/* Manual Override Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Manual Review Override
              </h3>
              <div className="space-y-3">
                <Select
                  name="overrideResult"
                  label="Override Decision"
                  value={overrideResult}
                  onChange={(e) => setOverrideResult(e.target.value)}
                  options={[
                    { value: "", label: "-- Select --" },
                    { value: "eligible", label: "Eligible / Shortlisted" },
                    { value: "not_eligible", label: "Not Eligible / Rejected" },
                  ]}
                />
                <TextArea
                  name="overrideRemarks"
                  label="Remarks"
                  value={overrideRemarks}
                  onChange={(e) => setOverrideRemarks(e.target.value)}
                  rows={3}
                  placeholder="Reason for overriding the auto-screening decision"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!overrideResult}
                    loading={overrideSubmitting}
                    onClick={handleOverride}
                  >
                    Submit Override
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
