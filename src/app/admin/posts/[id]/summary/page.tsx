"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  NPC_DOMAINS,
  ENGAGEMENT_TYPES,
  DESIGNATIONS,
  NPC_OFFICES,
} from "@/lib/constants";
import { Printer, AlertCircle } from "lucide-react";

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
  applicationDeadline: string;
  status: string;
}

interface Qualification {
  degree: string;
  isHighestQualification: boolean;
}

interface Experience {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

interface Application {
  id: string;
  applicationNo: string;
  fullName: string;
  dateOfBirth: string;
  emailId: string;
  contactNo: string;
  autoScreenScore: number | null;
  autoScreenResult: string | null;
  autoScreenDetails: string | null;
  status: string;
  submittedAt: string;
  qualifications: Qualification[];
  experiences: Experience[];
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

// ─── Component ──────────────────────────────────────────────────

export default function PostSummaryPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostRequirement | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [postRes, appsRes] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch(`/api/applications/engagement?postId=${postId}&limit=1000`),
      ]);

      if (!postRes.ok) throw new Error("Failed to fetch post");
      if (!appsRes.ok) throw new Error("Failed to fetch applications");

      const postData = await postRes.json();
      const appsData = await appsRes.json();

      setPost(postData.post || postData);
      setApplications(appsData.applications || []);
    } catch {
      setError("Failed to load summary data.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: applications.length,
    screened: applications.filter((a) => a.autoScreenScore !== null).length,
    eligible: applications.filter((a) => a.autoScreenResult === "eligible")
      .length,
    needsReview: applications.filter(
      (a) => a.autoScreenResult === "needs_review"
    ).length,
    notEligible: applications.filter(
      (a) => a.autoScreenResult === "not_eligible"
    ).length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
        <p className="text-sm text-red-700">{error || "Post not found."}</p>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #summary-report, #summary-report * { visibility: visible; }
          #summary-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          table { font-size: 10px; }
          th, td { padding: 4px 6px !important; }
        }
      `}</style>

      <div id="summary-report" className="space-y-6 max-w-6xl mx-auto">
        {/* Header with print button */}
        <div className="flex items-center justify-between no-print">
          <h1 className="text-2xl font-bold text-gray-900">
            Post-wise Summary Report
          </h1>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>

        {/* Post Details */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Advertisement No: {post.advertisementNo} | Status:{" "}
            <span className="capitalize">{post.status}</span>
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
            <SummaryField label="Domain" value={getDomainName(post.domain)} />
            <SummaryField
              label="Functional Role"
              value={getDesignationName(post.functionalRole)}
            />
            <SummaryField
              label="Engagement Type"
              value={getEngagementTypeName(post.engagementType)}
            />
            <SummaryField
              label="Place of Deployment"
              value={getOfficeName(post.placeOfDeployment)}
            />
            <SummaryField
              label="Positions"
              value={String(post.numberOfPositions)}
            />
            <SummaryField
              label="Min Qualification"
              value={post.minQualification}
            />
            <SummaryField
              label="Min Experience"
              value={`${post.minExperienceYears} year(s)`}
            />
            <SummaryField
              label="Max Age"
              value={
                post.maxAgeLimitYears
                  ? `${post.maxAgeLimitYears} years`
                  : "No limit"
              }
            />
            <SummaryField
              label="Remuneration"
              value={post.remunerationRange ?? "As per norms"}
            />
            <SummaryField
              label="Deadline"
              value={new Date(post.applicationDeadline).toLocaleDateString(
                "en-IN"
              )}
            />
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 text-center text-sm">
            <StatBox label="Total" value={stats.total} />
            <StatBox label="Screened" value={stats.screened} />
            <StatBox label="Eligible" value={stats.eligible} />
            <StatBox label="Needs Review" value={stats.needsReview} />
            <StatBox label="Not Eligible" value={stats.notEligible} />
            <StatBox label="Shortlisted" value={stats.shortlisted} />
            <StatBox label="Selected" value={stats.selected} />
            <StatBox label="Rejected" value={stats.rejected} />
          </div>
        </div>

        {/* Applicants Table */}
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-800">
              All Applicants ({applications.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    S.No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    App No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Age
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Qualification
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Exp (Yrs)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Score
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Screen Result
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-8 text-center text-gray-400"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((app, idx) => (
                    <tr key={app.id}>
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {app.applicationNo}
                      </td>
                      <td className="px-3 py-2">{app.fullName}</td>
                      <td className="px-3 py-2">{calcAge(app.dateOfBirth)}</td>
                      <td className="px-3 py-2">
                        {getHighestQualification(app.qualifications)}
                      </td>
                      <td className="px-3 py-2">
                        {calcTotalExpYears(app.experiences)}
                      </td>
                      <td className="px-3 py-2">
                        {app.autoScreenScore !== null
                          ? `${app.autoScreenScore}%`
                          : "\u2014"}
                      </td>
                      <td className="px-3 py-2">
                        {app.autoScreenResult ? (
                          <Badge
                            label={app.autoScreenResult.replace(/_/g, " ")}
                            status={app.autoScreenResult}
                            size="sm"
                          />
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          label={app.status.replace(/_/g, " ")}
                          status={app.status}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Screening Breakdown (for screened applicants) */}
        {applications.some((a) => a.autoScreenDetails) && (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">
                Auto-Screening Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Qualification
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Experience
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Age
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Retired Check
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Score
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications
                    .filter((a) => a.autoScreenDetails)
                    .map((app, idx) => {
                      const details = JSON.parse(app.autoScreenDetails!);
                      return (
                        <tr key={app.id}>
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{app.fullName}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full mr-1 ${
                                details.qualificationMatch?.met
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {details.qualificationMatch?.met
                              ? "Met"
                              : "Not Met"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full mr-1 ${
                                details.experienceMatch?.met
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {details.experienceMatch?.candidateTotalYears ?? 0}{" "}
                            yrs
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full mr-1 ${
                                details.ageMatch?.met
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {details.ageMatch?.candidateAge ?? "N/A"}
                          </td>
                          <td className="px-3 py-2">
                            {details.retiredPersonCheck?.applicable
                              ? details.retiredPersonCheck?.ppoProvided
                                ? "OK"
                                : "Missing PPO"
                              : "N/A"}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {app.autoScreenScore}%
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              label={(
                                details.overallResult ?? "unknown"
                              ).replace(/_/g, " ")}
                              status={details.overallResult ?? "unknown"}
                              size="sm"
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report footer */}
        <p className="text-xs text-gray-400 text-center">
          Generated on {new Date().toLocaleString("en-IN")} | NPC Contractual
          Engagement Portal
        </p>
      </div>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-gray-500">{label}:</span>{" "}
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
