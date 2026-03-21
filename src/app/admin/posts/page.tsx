"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import { NPC_DOMAINS } from "@/lib/constants";
import { Plus, AlertCircle } from "lucide-react";

type PostStatus = "all" | "active" | "closed";

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

export default function ManagePosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus>("all");

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
  ];

  const tabs: { key: PostStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "closed", label: "Closed" },
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
    </div>
  );
}
