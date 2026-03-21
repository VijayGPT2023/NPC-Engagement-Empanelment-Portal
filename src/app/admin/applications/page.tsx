"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import { ENGAGEMENT_STATUSES, EMPANELMENT_STATUSES } from "@/lib/constants";
import {
  AlertCircle,
  ScanSearch,
  Eye,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";

type AppTab = "engagement" | "empanelment";

interface Qualification {
  id: string;
  degree: string;
  discipline: string;
  collegeName: string;
  universityInstitution: string;
  yearOfPassing: number;
  marksPercentage: number | null;
  cgpa: number | null;
  isHighestQualification: boolean;
}

interface Experience {
  id: string;
  organizationName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  dutiesDescription: string;
  sectorType: string;
}

interface DocumentItem {
  id: string;
  documentType: string;
  documentName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  verificationStatus: string;
}

interface ScreeningReview {
  id: string;
  decision: string;
  remarks: string | null;
  score: number | null;
  reviewedAt: string;
}

interface EngagementApp {
  id: string;
  applicationNo: string;
  fullName: string;
  title: string;
  fatherMotherSpouseName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  aadhaarNo: string;
  contactNo: string;
  alternateContactNo: string | null;
  emailId: string;
  permanentAddress: string;
  correspondenceAddress: string;
  postAppliedFor: string;
  isRetiredPerson: boolean;
  ppoNumber: string | null;
  lastOrganization: string | null;
  lastDesignation: string | null;
  postRequirement?: { id: string; title: string; advertisementNo: string };
  submittedAt: string;
  autoScreenScore: number | null;
  autoScreenResult: string | null;
  autoScreenDetails: string | null;
  status: string;
  qualifications: Qualification[];
  experiences: Experience[];
  documents: DocumentItem[];
  screeningReviews?: ScreeningReview[];
}

interface EmpanelmentApp {
  id: string;
  applicationNo: string;
  fullName: string;
  categoryApplied: string;
  domains: string;
  submittedAt: string;
  autoScreenScore: number | null;
  status: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function calcAge(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calcTotalExpYears(experiences: Experience[]) {
  let totalMonths = 0;
  const now = new Date();
  for (const exp of experiences) {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent || !exp.endDate ? now : new Date(exp.endDate);
    if (end > start) {
      totalMonths +=
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
    }
  }
  return Math.round((totalMonths / 12) * 10) / 10;
}

function getHighestQualification(qualifications: Qualification[]) {
  const marked = qualifications.find((q) => q.isHighestQualification);
  return marked?.degree ?? qualifications[0]?.degree ?? "N/A";
}

// ─── Component ──────────────────────────────────────────────────

export default function ApplicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AppTab>("engagement");
  const [engagementApps, setEngagementApps] = useState<EngagementApp[]>([]);
  const [empanelmentApps, setEmpanelmentApps] = useState<EmpanelmentApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [screeningLoading, setScreeningLoading] = useState(false);

  // Detail modal
  const [selectedApp, setSelectedApp] = useState<EngagementApp | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Status change
  const [statusChangeIds, setStatusChangeIds] = useState<string[]>([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const statusParam = statusFilter ? `&status=${statusFilter}` : "";

      if (activeTab === "engagement") {
        const res = await fetch(
          `/api/applications/engagement?limit=100${statusParam}`
        );
        if (!res.ok) throw new Error("Failed to fetch engagement applications");
        const data = await res.json();
        setEngagementApps(data.applications || []);
      } else {
        const res = await fetch(
          `/api/applications/empanelment?limit=100${statusParam}`
        );
        if (!res.ok)
          throw new Error("Failed to fetch empanelment applications");
        const data = await res.json();
        setEmpanelmentApps(data.applications || []);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, statusFilter]);

  const handleRunBulkScreening = async () => {
    try {
      setScreeningLoading(true);
      const apps =
        activeTab === "engagement" ? engagementApps : empanelmentApps;
      const pendingApps = apps.filter(
        (a) => a.status === "submitted" && a.autoScreenScore === null
      );

      if (pendingApps.length === 0) {
        alert("No pending applications to screen.");
        return;
      }

      for (const app of pendingApps) {
        await fetch("/api/screening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: app.id,
            type: activeTab,
          }),
        });
      }

      alert(`Screening completed for ${pendingApps.length} application(s).`);
      fetchApplications();
    } catch (err) {
      console.error("Bulk screening error:", err);
      alert("Error running screening. Please try again.");
    } finally {
      setScreeningLoading(false);
    }
  };

  // ─── View Full Application ──────────────────────────────

  const handleViewApplication = async (appId: string) => {
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);
      const res = await fetch(`/api/applications/engagement/${appId}`);
      if (!res.ok) throw new Error("Failed to fetch application");
      const data = await res.json();
      setSelectedApp(data.application || data);
    } catch {
      alert("Failed to load application details.");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Change Status (single or bulk) ────────────────────

  const openStatusChange = (ids: string[]) => {
    setStatusChangeIds(ids);
    setNewStatus("");
    setRemarks("");
    setStatusModalOpen(true);
  };

  const handleStatusChange = async () => {
    if (!newStatus || statusChangeIds.length === 0) return;
    try {
      setStatusSaving(true);
      for (const id of statusChangeIds) {
        await fetch(`/api/applications/engagement/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, remarks }),
        });
      }
      alert(
        `Status updated for ${statusChangeIds.length} application(s).`
      );
      setStatusModalOpen(false);
      setStatusChangeIds([]);
      setNewStatus("");
      setRemarks("");
      setSelectedIds(new Set());
      fetchApplications();
    } catch {
      alert("Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  // ─── Bulk Selection ────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEngagement.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEngagement.map((a) => a.id)));
    }
  };

  // ─── Filter by search ──────────────────────────────────

  const filteredEngagement = engagementApps.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.applicationNo.toLowerCase().includes(q) ||
      app.fullName.toLowerCase().includes(q)
    );
  });

  const filteredEmpanelment = empanelmentApps.filter((app) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      app.applicationNo.toLowerCase().includes(q) ||
      app.fullName.toLowerCase().includes(q)
    );
  });

  // ─── Columns ───────────────────────────────────────────

  const engagementColumns = [
    {
      key: "_select",
      label: "",
      sortable: false,
      render: (_v: unknown, row: Record<string, unknown>) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(row.id as string);
          }}
          className="text-gray-500 hover:text-blue-600"
        >
          {selectedIds.has(row.id as string) ? (
            <CheckSquare className="h-4 w-4 text-blue-600" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </button>
      ),
    },
    { key: "applicationNo", label: "App No", sortable: true },
    { key: "fullName", label: "Name", sortable: true },
    {
      key: "postRequirement",
      label: "Post",
      sortable: false,
      render: (value: unknown) => {
        const post = value as
          | { title: string; advertisementNo: string }
          | undefined;
        return post ? (
          <span className="text-xs">
            {post.title}
            <br />
            <span className="text-gray-400">{post.advertisementNo}</span>
          </span>
        ) : (
          "\u2014"
        );
      },
    },
    {
      key: "submittedAt",
      label: "Date",
      sortable: true,
      render: (value: unknown) =>
        value
          ? new Date(value as string).toLocaleDateString("en-IN")
          : "\u2014",
    },
    {
      key: "autoScreenScore",
      label: "Auto-Screen Score",
      sortable: true,
      render: (value: unknown) =>
        value !== null && value !== undefined
          ? `${value}%`
          : "Not screened",
    },
    {
      key: "status",
      label: "Status",
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleViewApplication(row.id as string);
            }}
            className="rounded p-1 text-blue-600 hover:bg-blue-50"
            title="View Application"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openStatusChange([row.id as string]);
            }}
            className="rounded p-1 text-green-600 hover:bg-green-50"
            title="Change Status"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/admin/screening?type=engagement&applicationId=${row.id}`
              );
            }}
            className="rounded p-1 text-orange-600 hover:bg-orange-50"
            title="View Screening"
          >
            <ScanSearch className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const empanelmentColumns = [
    { key: "applicationNo", label: "App No", sortable: true },
    { key: "fullName", label: "Name", sortable: true },
    { key: "categoryApplied", label: "Category", sortable: true },
    { key: "domains", label: "Domain", sortable: true },
    {
      key: "submittedAt",
      label: "Date",
      sortable: true,
      render: (value: unknown) =>
        value
          ? new Date(value as string).toLocaleDateString("en-IN")
          : "\u2014",
    },
    {
      key: "autoScreenScore",
      label: "Auto-Screen Score",
      sortable: true,
      render: (value: unknown) =>
        value !== null && value !== undefined
          ? `${value}%`
          : "Not screened",
    },
    {
      key: "status",
      label: "Status",
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
            router.push(
              `/admin/screening?type=empanelment&applicationId=${row.id}`
            );
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const statusOptions =
    activeTab === "engagement"
      ? ENGAGEMENT_STATUSES.map((s) => ({ value: s.code, label: s.name }))
      : EMPANELMENT_STATUSES.map((s) => ({ value: s.code, label: s.name }));

  const tabs: { key: AppTab; label: string }[] = [
    { key: "engagement", label: "Engagement" },
    { key: "empanelment", label: "Empanelment" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          All Applications
        </h1>
        <div className="flex items-center gap-2">
          {activeTab === "engagement" && selectedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openStatusChange(Array.from(selectedIds))}
            >
              <FileText className="h-4 w-4" />
              Change Status ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="secondary"
            loading={screeningLoading}
            onClick={handleRunBulkScreening}
          >
            <ScanSearch className="h-4 w-4" />
            Run Auto-Screening
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setStatusFilter("");
              setSearch("");
              setSelectedIds(new Set());
            }}
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          name="search"
          label="Search"
          placeholder="Search by name or app number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
        <Select
          name="statusFilter"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "All Statuses" }, ...statusOptions]}
          className="sm:w-48"
        />
        {activeTab === "engagement" && filteredEngagement.length > 0 && (
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedIds.size === filteredEngagement.length
              ? "Deselect All"
              : "Select All"}
          </Button>
        )}
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
        ) : activeTab === "engagement" ? (
          <DataTable
            columns={engagementColumns}
            data={
              filteredEngagement as unknown as Record<string, unknown>[]
            }
            onRowClick={(row) =>
              handleViewApplication(row.id as string)
            }
            pageSize={10}
          />
        ) : (
          <DataTable
            columns={empanelmentColumns}
            data={
              filteredEmpanelment as unknown as Record<string, unknown>[]
            }
            onRowClick={(row) =>
              router.push(
                `/admin/screening?type=empanelment&applicationId=${row.id}`
              )
            }
            pageSize={10}
          />
        )}
      </Card>

      {/* ─── Status Change Modal ──────────────────────────── */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusChangeIds([]);
          setNewStatus("");
          setRemarks("");
        }}
        title={`Change Status (${statusChangeIds.length} application${statusChangeIds.length > 1 ? "s" : ""})`}
        size="md"
      >
        <div className="space-y-4">
          <Select
            name="newStatus"
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            placeholder="Select status..."
            options={[
              { value: "under_screening", label: "Under Screening" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "selected", label: "Selected" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
          <TextArea
            name="remarks"
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="Enter remarks (optional)..."
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusModalOpen(false);
                setStatusChangeIds([]);
                setNewStatus("");
                setRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={statusSaving}
              disabled={!newStatus}
              onClick={handleStatusChange}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── View Full Application Modal ──────────────────── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedApp(null);
        }}
        title={
          selectedApp
            ? `Application: ${selectedApp.applicationNo}`
            : "Loading..."
        }
        size="xl"
      >
        {detailLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : selectedApp ? (
          <div className="space-y-5">
            {/* Status bar */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <Badge
                  label={selectedApp.status.replace(/_/g, " ")}
                  status={selectedApp.status}
                  size="md"
                />
                {selectedApp.autoScreenScore !== null && (
                  <span className="text-sm text-gray-600">
                    Score: <strong>{selectedApp.autoScreenScore}%</strong>
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedApp(null);
                  openStatusChange([selectedApp.id]);
                }}
              >
                Change Status
              </Button>
            </div>

            {/* Post reference */}
            {selectedApp.postRequirement && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-medium text-blue-600">Applied For</p>
                <p className="text-sm font-semibold text-blue-900">
                  {selectedApp.postRequirement.title} ({selectedApp.postRequirement.advertisementNo})
                </p>
              </div>
            )}

            {/* Personal Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Personal Details
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                <Field
                  label="Full Name"
                  value={`${selectedApp.title} ${selectedApp.fullName}`}
                />
                <Field
                  label="Father/Mother/Spouse"
                  value={selectedApp.fatherMotherSpouseName}
                />
                <Field
                  label="Date of Birth"
                  value={new Date(selectedApp.dateOfBirth).toLocaleDateString("en-IN")}
                />
                <Field
                  label="Age"
                  value={`${calcAge(selectedApp.dateOfBirth)} years`}
                />
                <Field label="Gender" value={selectedApp.gender} />
                <Field label="Contact" value={selectedApp.contactNo} />
                <Field label="Email" value={selectedApp.emailId} />
                <Field
                  label="Aadhaar No"
                  value={selectedApp.aadhaarNo}
                />
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Qualifications ({selectedApp.qualifications.length})
              </h4>
              {selectedApp.qualifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Degree
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Discipline
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          University
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Year
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Marks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedApp.qualifications.map((q) => (
                        <tr key={q.id}>
                          <td className="px-2 py-1">
                            {q.degree}
                            {q.isHighestQualification && (
                              <span className="ml-1 text-green-600 text-[10px]">
                                (Highest)
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-1">{q.discipline}</td>
                          <td className="px-2 py-1">
                            {q.universityInstitution}
                          </td>
                          <td className="px-2 py-1">{q.yearOfPassing}</td>
                          <td className="px-2 py-1">
                            {q.marksPercentage
                              ? `${q.marksPercentage}%`
                              : q.cgpa
                                ? `CGPA ${q.cgpa}`
                                : "\u2014"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No qualifications recorded.
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Experience ({selectedApp.experiences.length}) - Total:{" "}
                {calcTotalExpYears(selectedApp.experiences)} years
              </h4>
              {selectedApp.experiences.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Organization
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Designation
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Period
                        </th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-600">
                          Sector
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedApp.experiences.map((e) => (
                        <tr key={e.id}>
                          <td className="px-2 py-1">{e.organizationName}</td>
                          <td className="px-2 py-1">{e.designation}</td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {new Date(e.startDate).toLocaleDateString("en-IN")}{" "}
                            -{" "}
                            {e.isCurrent
                              ? "Present"
                              : e.endDate
                                ? new Date(e.endDate).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "\u2014"}
                          </td>
                          <td className="px-2 py-1 capitalize">
                            {e.sectorType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  No experience recorded.
                </p>
              )}
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Documents ({selectedApp.documents.length})
              </h4>
              {selectedApp.documents.length > 0 ? (
                <ul className="divide-y divide-gray-100 text-xs">
                  {selectedApp.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-gray-700">
                        {doc.documentName} ({doc.documentType.replace(/_/g, " ")})
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          label={doc.verificationStatus}
                          status={doc.verificationStatus}
                          size="sm"
                        />
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">
                  No documents uploaded.
                </p>
              )}
            </div>

            {/* Screening */}
            {selectedApp.autoScreenDetails && (
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Screening Breakdown
                </h4>
                <ScreeningBreakdown
                  details={JSON.parse(selectedApp.autoScreenDetails)}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No data loaded.</p>
        )}
      </Modal>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500">{label}:</span>{" "}
      <span className="text-gray-900">{value || "\u2014"}</span>
    </div>
  );
}

function ScreeningBreakdown({
  details,
}: {
  details: Record<string, unknown>;
}) {
  const d = details as {
    qualificationMatch?: { met: boolean; remarks: string };
    experienceMatch?: { met: boolean; remarks: string };
    ageMatch?: { met: boolean; remarks: string };
    retiredPersonCheck?: {
      applicable: boolean;
      ppoProvided: boolean;
      remarks: string;
    };
    remarks?: string[];
  };

  return (
    <div className="space-y-2 text-xs">
      {d.qualificationMatch && (
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${d.qualificationMatch.met ? "bg-green-500" : "bg-red-500"}`}
          />
          <div>
            <strong>Qualification:</strong> {d.qualificationMatch.remarks}
          </div>
        </div>
      )}
      {d.experienceMatch && (
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${d.experienceMatch.met ? "bg-green-500" : "bg-red-500"}`}
          />
          <div>
            <strong>Experience:</strong> {d.experienceMatch.remarks}
          </div>
        </div>
      )}
      {d.ageMatch && (
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${d.ageMatch.met ? "bg-green-500" : "bg-red-500"}`}
          />
          <div>
            <strong>Age:</strong> {d.ageMatch.remarks}
          </div>
        </div>
      )}
      {d.retiredPersonCheck?.applicable && (
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 h-3 w-3 flex-shrink-0 rounded-full ${d.retiredPersonCheck.ppoProvided ? "bg-green-500" : "bg-yellow-500"}`}
          />
          <div>
            <strong>Retired Check:</strong> {d.retiredPersonCheck.remarks}
          </div>
        </div>
      )}
      {d.remarks && d.remarks.length > 0 && (
        <div className="rounded bg-gray-50 p-2 mt-2">
          <strong>Summary:</strong>
          <ul className="list-disc list-inside mt-1">
            {d.remarks.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
