"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import {
  ENGAGEMENT_STATUSES,
  NPC_DOMAINS,
  ENGAGEMENT_TYPES,
  DESIGNATIONS,
  NPC_OFFICES,
} from "@/lib/constants";
import {
  AlertCircle,
  Download,
  ScanSearch,
  Edit,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface PostRequirement {
  id: string;
  advertisementNo: string;
  title: string;
  functionalRole: string;
  domain: string;
  engagementType: string;
  numberOfPositions: number;
  placeOfDeployment: string;
  minQualification: string;
  minExperienceYears: number;
  maxAgeLimitYears: number | null;
  remunerationRange: string | null;
  contractPeriod: string | null;
  eligibilityCriteria: string;
  workResponsibilities: string;
  applicationDeadline: string;
  status: string;
}

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
  documentId: string | null;
}

interface Experience {
  id: string;
  organizationName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  remunerationPayBand: string | null;
  dutiesDescription: string;
  sectorType: string;
  documentId: string | null;
}

interface DocumentItem {
  id: string;
  documentType: string;
  documentName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
}

interface ScreeningReview {
  id: string;
  reviewerId: string;
  decision: string;
  remarks: string | null;
  score: number | null;
  reviewedAt: string;
}

interface Application {
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
  retirementDate: string | null;
  lastOrganization: string | null;
  lastDesignation: string | null;
  ppoNumber: string | null;
  autoScreenScore: number | null;
  autoScreenResult: string | null;
  autoScreenDetails: string | null;
  status: string;
  submittedAt: string;
  qualifications: Qualification[];
  experiences: Experience[];
  documents: DocumentItem[];
  screeningReviews?: ScreeningReview[];
  postRequirement?: {
    id: string;
    title: string;
    advertisementNo: string;
    functionalRole: string;
    domain: string;
  };
}

// ─── Helpers ────────────────────────────────────────────────────

function getDomainName(code: string) {
  return NPC_DOMAINS.find((d) => d.code === code)?.name ?? code;
}

function getEngagementTypeName(code: string) {
  return ENGAGEMENT_TYPES.find((t) => t.code === code)?.name ?? code;
}

function getDesignationName(code: string) {
  return (
    DESIGNATIONS.find((d) => d.code === code)?.name ??
    code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function getOfficeName(code: string) {
  return NPC_OFFICES.find((o) => o.code === code)?.name ?? code;
}

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

function downloadCSV(rows: Record<string, string>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ──────────────────────────────────────────────────

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostRequirement | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");

  // Modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Status change
  const [statusChangeApp, setStatusChangeApp] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  // Bulk
  const [screeningAll, setScreeningAll] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [closingPost, setClosingPost] = useState(false);

  // ─── Fetch Post ─────────────────────────────────────────

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      const data = await res.json();
      setPost(data.post || data);
    } catch {
      setError("Failed to load post details.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // ─── Fetch Applications ─────────────────────────────────

  const fetchApplications = useCallback(async () => {
    try {
      setAppsLoading(true);
      const statusParam = statusFilter ? `&status=${statusFilter}` : "";
      const res = await fetch(
        `/api/applications/engagement?postId=${postId}&limit=500${statusParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  }, [postId, statusFilter]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ─── View Full Application ──────────────────────────────

  const handleViewApplication = async (appId: string) => {
    try {
      setDetailLoading(true);
      setModalOpen(true);
      const res = await fetch(`/api/applications/engagement/${appId}`);
      if (!res.ok) throw new Error("Failed to fetch application");
      const data = await res.json();
      setSelectedApp(data.application || data);
    } catch {
      alert("Failed to load application details.");
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Run Individual Screening ───────────────────────────

  const handleRunScreening = async (appId: string) => {
    try {
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, type: "engagement" }),
      });
      if (!res.ok) throw new Error("Screening failed");
      alert("Screening completed.");
      fetchApplications();
    } catch {
      alert("Failed to run screening.");
    }
  };

  // ─── Change Status ──────────────────────────────────────

  const handleStatusChange = async () => {
    if (!statusChangeApp || !newStatus) return;
    try {
      setStatusSaving(true);
      const res = await fetch(
        `/api/applications/engagement/${statusChangeApp}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, remarks }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      alert("Status updated successfully.");
      setStatusChangeApp(null);
      setNewStatus("");
      setRemarks("");
      fetchApplications();
    } catch {
      alert("Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  // ─── Screen All Pending ─────────────────────────────────

  const handleScreenAllPending = async () => {
    const pending = applications.filter(
      (a) => a.status === "submitted" && a.autoScreenScore === null
    );
    if (pending.length === 0) {
      alert("No pending applications to screen.");
      return;
    }
    try {
      setScreeningAll(true);
      for (const app of pending) {
        await fetch("/api/screening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: app.id, type: "engagement" }),
        });
      }
      alert(`Screening completed for ${pending.length} application(s).`);
      fetchApplications();
    } catch {
      alert("Error running bulk screening.");
    } finally {
      setScreeningAll(false);
    }
  };

  // ─── Close Post ─────────────────────────────────────────

  const handleClosePost = async () => {
    try {
      setClosingPost(true);
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) throw new Error("Failed to close post");
      alert("Post closed successfully.");
      setCloseConfirm(false);
      fetchPost();
    } catch {
      alert("Failed to close post.");
    } finally {
      setClosingPost(false);
    }
  };

  // ─── Download CSV ───────────────────────────────────────

  const handleDownloadCSV = () => {
    const rows = applications.map((app, idx) => ({
      "S.No": String(idx + 1),
      "App No": app.applicationNo,
      Name: app.fullName,
      "Date of Birth": new Date(app.dateOfBirth).toLocaleDateString("en-IN"),
      Age: String(calcAge(app.dateOfBirth)),
      "Highest Qualification": getHighestQualification(app.qualifications),
      "Total Experience (Years)": String(calcTotalExpYears(app.experiences)),
      "Auto-Screen Score":
        app.autoScreenScore !== null ? String(app.autoScreenScore) : "N/A",
      "Auto-Screen Result": app.autoScreenResult ?? "N/A",
      Status: app.status.replace(/_/g, " "),
      Email: app.emailId,
      Contact: app.contactNo,
      "Submitted At": new Date(app.submittedAt).toLocaleDateString("en-IN"),
    }));
    downloadCSV(rows, `${post?.advertisementNo ?? "post"}_applications.csv`);
  };

  // ─── Filtering & Sorting ────────────────────────────────

  const filtered = applications
    .filter((app) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(q) ||
        app.applicationNo.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "score")
        return (b.autoScreenScore ?? 0) - (a.autoScreenScore ?? 0);
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      return (
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    });

  // ─── Statistics ─────────────────────────────────────────

  const stats = {
    total: applications.length,
    screened: applications.filter((a) => a.autoScreenScore !== null).length,
    eligible: applications.filter((a) => a.autoScreenResult === "eligible")
      .length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // ─── Table Columns ─────────────────────────────────────

  const columns = [
    {
      key: "_sno",
      label: "S.No",
      sortable: false,
      render: (_v: unknown, _r: Record<string, unknown>, idx?: number) =>
        idx !== undefined ? idx + 1 : "-",
    },
    { key: "applicationNo", label: "App No", sortable: true },
    { key: "fullName", label: "Applicant Name", sortable: true },
    {
      key: "qualifications",
      label: "Qualification",
      sortable: false,
      render: (value: unknown) => {
        const quals = value as Qualification[];
        return getHighestQualification(quals);
      },
    },
    {
      key: "experiences",
      label: "Experience (Yrs)",
      sortable: false,
      render: (value: unknown) => {
        const exps = value as Experience[];
        return calcTotalExpYears(exps);
      },
    },
    {
      key: "dateOfBirth",
      label: "Age",
      sortable: true,
      render: (value: unknown) => calcAge(value as string),
    },
    {
      key: "autoScreenScore",
      label: "Score",
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
            title="View Full Application"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRunScreening(row.id as string);
            }}
            className="rounded p-1 text-orange-600 hover:bg-orange-50"
            title="Run Screening"
          >
            <ScanSearch className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setStatusChangeApp(row.id as string);
            }}
            className="rounded p-1 text-green-600 hover:bg-green-50"
            title="Change Status"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <Badge
              label={post.status.replace(/_/g, " ")}
              status={post.status}
              size="md"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Adv No: {post.advertisementNo}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/admin/posts/create?id=${post.id}`)
            }
          >
            <Edit className="h-4 w-4" />
            Edit Post
          </Button>
          {post.status === "active" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCloseConfirm(true)}
            >
              <XCircle className="h-4 w-4" />
              Close Post
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4" />
            Download All (CSV)
          </Button>
        </div>
      </div>

      {/* ─── Post Details Card ────────────────────────────── */}
      <Card title="Post Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Domain" value={getDomainName(post.domain)} />
          <Detail
            label="Functional Role"
            value={getDesignationName(post.functionalRole)}
          />
          <Detail
            label="Engagement Type"
            value={getEngagementTypeName(post.engagementType)}
          />
          <Detail
            label="Place of Deployment"
            value={getOfficeName(post.placeOfDeployment)}
          />
          <Detail label="Positions" value={String(post.numberOfPositions)} />
          <Detail
            label="Deadline"
            value={new Date(post.applicationDeadline).toLocaleDateString(
              "en-IN"
            )}
          />
          <Detail
            label="Min Qualification"
            value={post.minQualification}
          />
          <Detail
            label="Min Experience"
            value={`${post.minExperienceYears} year(s)`}
          />
          <Detail
            label="Max Age"
            value={
              post.maxAgeLimitYears
                ? `${post.maxAgeLimitYears} years`
                : "No limit"
            }
          />
          <Detail
            label="Remuneration"
            value={post.remunerationRange ?? "As per norms"}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Detail
            label="Eligibility Criteria"
            value={post.eligibilityCriteria}
            block
          />
          <Detail
            label="Work Responsibilities"
            value={post.workResponsibilities}
            block
          />
        </div>
      </Card>

      {/* ─── Statistics Bar ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Screened" value={stats.screened} color="yellow" />
        <StatCard label="Eligible" value={stats.eligible} color="green" />
        <StatCard
          label="Shortlisted"
          value={stats.shortlisted}
          color="indigo"
        />
        <StatCard label="Selected" value={stats.selected} color="emerald" />
        <StatCard label="Rejected" value={stats.rejected} color="red" />
      </div>

      {/* ─── Bulk Actions ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={screeningAll}
          onClick={handleScreenAllPending}
        >
          <ScanSearch className="h-4 w-4" />
          Screen All Pending
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
          <Download className="h-4 w-4" />
          Download Summary Report
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Zip download feature coming soon.")}
        >
          <Download className="h-4 w-4" />
          Download All Documents
        </Button>
      </div>

      {/* ─── Filters ──────────────────────────────────────── */}
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
          options={[
            { value: "", label: "All Statuses" },
            ...ENGAGEMENT_STATUSES.map((s) => ({
              value: s.code,
              label: s.name,
            })),
          ]}
          className="sm:w-48"
        />
        <Select
          name="sortBy"
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: "submittedAt", label: "Date (Latest)" },
            { value: "score", label: "Score (Highest)" },
            { value: "name", label: "Name (A-Z)" },
          ]}
          className="sm:w-48"
        />
      </div>

      {/* ─── Applications Table ───────────────────────────── */}
      <Card>
        {appsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered as unknown as Record<string, unknown>[]}
            onRowClick={(row) =>
              handleViewApplication(row.id as string)
            }
            pageSize={15}
          />
        )}
      </Card>

      {/* ─── Close Post Confirmation Modal ────────────────── */}
      <Modal
        isOpen={closeConfirm}
        onClose={() => setCloseConfirm(false)}
        title="Confirm Close Post"
        size="sm"
      >
        <p className="mb-4 text-sm text-gray-700">
          Are you sure you want to close this post? No new applications will be
          accepted after closing.
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCloseConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={closingPost}
            onClick={handleClosePost}
          >
            Close Post
          </Button>
        </div>
      </Modal>

      {/* ─── Status Change Modal ──────────────────────────── */}
      <Modal
        isOpen={!!statusChangeApp}
        onClose={() => {
          setStatusChangeApp(null);
          setNewStatus("");
          setRemarks("");
        }}
        title="Change Application Status"
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
              { value: "shortlisted", label: "Shortlisted" },
              { value: "selected", label: "Selected" },
              { value: "rejected", label: "Rejected" },
              { value: "under_screening", label: "Under Screening" },
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
                setStatusChangeApp(null);
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
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
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
          <ApplicationDetailContent
            app={selectedApp}
            onStatusChange={(id) => {
              setModalOpen(false);
              setSelectedApp(null);
              setStatusChangeApp(id);
            }}
          />
        ) : (
          <p className="text-sm text-gray-500">No data loaded.</p>
        )}
      </Modal>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Detail({
  label,
  value,
  block,
}: {
  label: string;
  value: string;
  block?: boolean;
}) {
  return (
    <div className={block ? "col-span-full sm:col-span-1" : ""}>
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
        {value || "\u2014"}
      </dd>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: "bg-green-50 border-green-200",
    indigo: "bg-indigo-50 border-indigo-200",
    emerald: "bg-emerald-50 border-emerald-200",
    red: "bg-red-50 border-red-200",
  };
  const textMap: Record<string, string> = {
    blue: "text-blue-700",
    yellow: "text-yellow-700",
    green: "text-green-700",
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    red: "text-red-700",
  };

  return (
    <div
      className={`rounded-lg border p-4 text-center ${bgMap[color] ?? "bg-gray-50 border-gray-200"}`}
    >
      <p className={`text-2xl font-bold ${textMap[color] ?? "text-gray-700"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

function ApplicationDetailContent({
  app,
  onStatusChange,
}: {
  app: Application;
  onStatusChange: (id: string) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "personal"
  );

  const toggle = (section: string) =>
    setExpandedSection((s) => (s === section ? null : section));

  const screenDetails = app.autoScreenDetails
    ? JSON.parse(app.autoScreenDetails)
    : null;

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
        <div className="flex items-center gap-3">
          <Badge
            label={app.status.replace(/_/g, " ")}
            status={app.status}
            size="md"
          />
          {app.autoScreenScore !== null && (
            <span className="text-sm text-gray-600">
              Score: <strong>{app.autoScreenScore}%</strong>
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => onStatusChange(app.id)}>
          Change Status
        </Button>
      </div>

      {/* Personal Details */}
      <CollapsibleSection
        title="Personal Details"
        id="personal"
        expanded={expandedSection === "personal"}
        onToggle={() => toggle("personal")}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="Full Name" value={`${app.title} ${app.fullName}`} />
          <Detail
            label="Father/Mother/Spouse"
            value={app.fatherMotherSpouseName}
          />
          <Detail
            label="Date of Birth"
            value={new Date(app.dateOfBirth).toLocaleDateString("en-IN")}
          />
          <Detail label="Age" value={`${calcAge(app.dateOfBirth)} years`} />
          <Detail label="Gender" value={app.gender} />
          <Detail label="Nationality" value={app.nationality} />
          <Detail label="Aadhaar No" value={app.aadhaarNo} />
          <Detail label="Contact" value={app.contactNo} />
          <Detail label="Email" value={app.emailId} />
          <Detail
            label="Permanent Address"
            value={app.permanentAddress}
          />
          <Detail
            label="Correspondence Address"
            value={app.correspondenceAddress}
          />
          {app.isRetiredPerson && (
            <>
              <Detail
                label="Retired Person"
                value="Yes"
              />
              <Detail
                label="PPO Number"
                value={app.ppoNumber ?? "Not provided"}
              />
              <Detail
                label="Last Organization"
                value={app.lastOrganization ?? "N/A"}
              />
              <Detail
                label="Last Designation"
                value={app.lastDesignation ?? "N/A"}
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Qualifications */}
      <CollapsibleSection
        title={`Qualifications (${app.qualifications.length})`}
        id="qualifications"
        expanded={expandedSection === "qualifications"}
        onToggle={() => toggle("qualifications")}
      >
        {app.qualifications.length === 0 ? (
          <p className="text-sm text-gray-500">No qualifications recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Degree
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Discipline
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    College / University
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Year
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Marks %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Highest
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {app.qualifications.map((q) => (
                  <tr key={q.id}>
                    <td className="px-3 py-2">{q.degree}</td>
                    <td className="px-3 py-2">{q.discipline}</td>
                    <td className="px-3 py-2">
                      {q.collegeName}, {q.universityInstitution}
                    </td>
                    <td className="px-3 py-2">{q.yearOfPassing}</td>
                    <td className="px-3 py-2">
                      {q.marksPercentage
                        ? `${q.marksPercentage}%`
                        : q.cgpa
                          ? `CGPA ${q.cgpa}`
                          : "\u2014"}
                    </td>
                    <td className="px-3 py-2">
                      {q.isHighestQualification ? "Yes" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {/* Experiences */}
      <CollapsibleSection
        title={`Experience (${app.experiences.length}) - Total: ${calcTotalExpYears(app.experiences)} years`}
        id="experience"
        expanded={expandedSection === "experience"}
        onToggle={() => toggle("experience")}
      >
        {app.experiences.length === 0 ? (
          <p className="text-sm text-gray-500">No experience recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Organization
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Designation
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Period
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Sector
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Duties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {app.experiences.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2">{e.organizationName}</td>
                    <td className="px-3 py-2">{e.designation}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(e.startDate).toLocaleDateString("en-IN")} -{" "}
                      {e.isCurrent
                        ? "Present"
                        : e.endDate
                          ? new Date(e.endDate).toLocaleDateString("en-IN")
                          : "\u2014"}
                    </td>
                    <td className="px-3 py-2 capitalize">{e.sectorType}</td>
                    <td className="max-w-xs truncate px-3 py-2">
                      {e.dutiesDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {/* Documents */}
      <CollapsibleSection
        title={`Documents (${app.documents.length})`}
        id="documents"
        expanded={expandedSection === "documents"}
        onToggle={() => toggle("documents")}
      >
        {app.documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {app.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {doc.documentName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.documentType.replace(/_/g, " ")} |{" "}
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
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
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      {/* Screening Result */}
      {screenDetails && (
        <CollapsibleSection
          title="Screening Result Breakdown"
          id="screening"
          expanded={expandedSection === "screening"}
          onToggle={() => toggle("screening")}
        >
          <div className="space-y-3">
            {screenDetails.qualificationMatch && (
              <ScreeningItem
                label="Qualification"
                met={screenDetails.qualificationMatch.met}
                remarks={screenDetails.qualificationMatch.remarks}
              />
            )}
            {screenDetails.experienceMatch && (
              <ScreeningItem
                label="Experience"
                met={screenDetails.experienceMatch.met}
                remarks={screenDetails.experienceMatch.remarks}
              />
            )}
            {screenDetails.ageMatch && (
              <ScreeningItem
                label="Age"
                met={screenDetails.ageMatch.met}
                remarks={screenDetails.ageMatch.remarks}
              />
            )}
            {screenDetails.retiredPersonCheck && (
              <ScreeningItem
                label="Retired Person Check"
                met={
                  !screenDetails.retiredPersonCheck.applicable ||
                  screenDetails.retiredPersonCheck.ppoProvided
                }
                remarks={screenDetails.retiredPersonCheck.remarks}
              />
            )}
            {screenDetails.remunerationBand && (
              <ScreeningItem
                label="Remuneration Band"
                met={true}
                remarks={screenDetails.remunerationBand.remarks}
              />
            )}
            {screenDetails.remarks && screenDetails.remarks.length > 0 && (
              <div className="rounded bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Summary Remarks:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {screenDetails.remarks.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Screening Reviews */}
      {app.screeningReviews && app.screeningReviews.length > 0 && (
        <CollapsibleSection
          title={`Manual Reviews (${app.screeningReviews.length})`}
          id="reviews"
          expanded={expandedSection === "reviews"}
          onToggle={() => toggle("reviews")}
        >
          <ul className="divide-y divide-gray-100">
            {app.screeningReviews.map((review) => (
              <li key={review.id} className="py-2">
                <div className="flex items-center gap-2">
                  <Badge
                    label={review.decision.replace(/_/g, " ")}
                    status={review.decision}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(review.reviewedAt).toLocaleString("en-IN")}
                  </span>
                  {review.score !== null && (
                    <span className="text-xs text-gray-500">
                      Score: {review.score}
                    </span>
                  )}
                </div>
                {review.remarks && (
                  <p className="mt-1 text-sm text-gray-700">
                    {review.remarks}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  id,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  id: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-3">{children}</div>
      )}
    </div>
  );
}

function ScreeningItem({
  label,
  met,
  remarks,
}: {
  label: string;
  met: boolean;
  remarks: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span
        className={`mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded-full ${
          met ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-600">{remarks}</p>
      </div>
    </div>
  );
}
