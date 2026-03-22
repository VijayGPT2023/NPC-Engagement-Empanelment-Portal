"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { NPC_DOMAINS } from "@/lib/constants";
import { Plus, AlertCircle, Download, Upload, Pencil, CheckCircle } from "lucide-react";

type PostStatus = "all" | "active" | "on_hold" | "closed" | "cancelled";

interface Post {
  id: string;
  advertisementNo: string;
  title: string;
  domain: string;
  functionalRole: string;
  numberOfPositions: number;
  applicationDeadline: string;
  status: string;
  _count?: { engagementApplications: number };
}

interface BulkResult {
  row: number;
  advNo: string;
  status: "created" | "skipped" | "error";
  message: string;
}

interface BulkResponse {
  message: string;
  summary: { total: number; created: number; skipped: number; errors: number };
  results: BulkResult[];
}

export default function ManagePosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus>("all");

  // Bulk upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkResponse | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError("");
        const statusParam =
          statusFilter === "all" ? "" : `&status=${statusFilter}`;
        const res = await fetch(`/api/posts?limit=100${statusParam}`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Fetch posts error:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [statusFilter]);

  const getDomainName = (code: string) => {
    const domain = NPC_DOMAINS.find((d) => d.code === code);
    return domain ? domain.name : code;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setUploadError("Only .xlsx or .xls files are accepted.");
      setShowUploadModal(true);
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/posts/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        setShowUploadModal(true);
        return;
      }

      setUploadResult(data);
      setShowUploadModal(true);

      // Refresh posts list if any were created
      if (data.summary?.created > 0) {
        const statusParam = statusFilter === "all" ? "" : `&status=${statusFilter}`;
        const refreshRes = await fetch(`/api/posts?limit=100${statusParam}`);
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setPosts(refreshData.posts || []);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("An unexpected error occurred during upload.");
      setShowUploadModal(true);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      key: "advertisementNo",
      label: "Adv No",
      sortable: true,
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "domain",
      label: "Domain",
      sortable: true,
      render: (value: unknown) => getDomainName(value as string),
    },
    {
      key: "functionalRole",
      label: "Designation",
      sortable: true,
      render: (value: unknown) =>
        (value as string).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    {
      key: "numberOfPositions",
      label: "Positions",
      sortable: true,
    },
    {
      key: "applicationDeadline",
      label: "Deadline",
      sortable: true,
      render: (value: unknown) =>
        value
          ? new Date(value as string).toLocaleDateString("en-IN")
          : "\u2014",
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
      key: "_count",
      label: "Applications",
      sortable: false,
      render: (value: unknown) => {
        const count = value as { engagementApplications?: number } | undefined;
        return count?.engagementApplications ?? "\u2014";
      },
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_value: unknown, row: Record<string, unknown>) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/posts/${row.id}/edit`);
          }}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          title="Edit post"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      ),
    },
  ];

  const tabs: { key: PostStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "on_hold", label: "On Hold" },
    { key: "closed", label: "Closed" },
    { key: "cancelled", label: "Cancelled" },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage Post Requirements
        </h1>
        <Button onClick={() => router.push("/admin/posts/create")}>
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Bulk Upload Section */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Bulk Operations</h3>
            <p className="text-xs text-gray-500">Upload multiple posts via Excel spreadsheet</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/api/posts/template"
              download
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template
            </a>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Excel"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`
              rounded-md px-4 py-2 text-sm font-medium transition-colors
              ${
                statusFilter === tab.key
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Table */}
      <Card>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={posts as unknown as Record<string, unknown>[]}
            onRowClick={(row) =>
              router.push(`/admin/posts/${row.id}`)
            }
            pageSize={10}
          />
        )}
      </Card>

      {/* Bulk Upload Results Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadResult(null);
          setUploadError("");
        }}
        title="Bulk Upload Results"
        size="lg"
      >
        {uploadError && !uploadResult && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              <p className="text-sm text-green-700">{uploadResult.message}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{uploadResult.summary.total}</div>
                <div className="text-xs text-gray-500">Total Rows</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-lg font-bold text-green-700">{uploadResult.summary.created}</div>
                <div className="text-xs text-green-600">Created</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center">
                <div className="text-lg font-bold text-yellow-700">{uploadResult.summary.skipped}</div>
                <div className="text-xs text-yellow-600">Skipped</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-lg font-bold text-red-700">{uploadResult.summary.errors}</div>
                <div className="text-xs text-red-600">Errors</div>
              </div>
            </div>

            {/* Detail rows */}
            {uploadResult.results.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Row</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Adv No</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {uploadResult.results.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-700">{r.row}</td>
                        <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.advNo || "--"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.status === "created"
                                ? "bg-green-100 text-green-700"
                                : r.status === "skipped"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{r.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
