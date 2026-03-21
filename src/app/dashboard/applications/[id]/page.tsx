"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ENGAGEMENT_STATUSES, EMPANELMENT_STATUSES, NPC_OFFICES, NPC_DOMAINS } from "@/lib/constants";
import { ArrowLeft, Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppData = Record<string, any>;

const statusTimeline = [
  { key: "submitted", label: "Submitted", icon: FileText },
  { key: "under_screening", label: "Under Screening", icon: Clock },
  { key: "shortlisted", label: "Shortlisted", icon: CheckCircle },
  { key: "selected", label: "Selected / Empanelled", icon: CheckCircle },
];

function getStatusIndex(status: string): number {
  if (["rejected"].includes(status)) return -1;
  return statusTimeline.findIndex((s) => s.key === status);
}

function statusLabel(status: string, type: string): string {
  const list = type === "engagement" ? ENGAGEMENT_STATUSES : EMPANELMENT_STATUSES;
  return list.find((s) => s.code === status)?.name ?? status;
}

function officeName(code: string): string {
  return NPC_OFFICES.find((o) => o.code === code)?.name ?? code;
}

function domainNames(codes: string): string {
  return codes
    .split(",")
    .map((c) => NPC_DOMAINS.find((d) => d.code === c.trim())?.name ?? c.trim())
    .join(", ");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "—"}</dd>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const type = (searchParams.get("type") as "engagement" | "empanelment") || "engagement";

  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        // Try to fetch from the application-specific endpoint
        const res = await fetch(`/api/applications/${type}?id=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          // If the API returns a single app or array, handle both
          if (Array.isArray(data)) {
            const found = data.find((a: AppData) => a.id === id);
            setApp(found || null);
          } else if (data.applications) {
            const found = data.applications.find((a: AppData) => a.id === id);
            setApp(found || null);
          } else {
            setApp(data);
          }
        } else {
          setError("Failed to load application details");
        }
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || "Application not found"}</p>
        <Link href="/dashboard/applications" className="text-blue-600 hover:underline">
          Back to My Applications
        </Link>
      </div>
    );
  }

  const currentStatusIdx = getStatusIndex(app.status);
  const isRejected = app.status === "rejected";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/applications" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Application {app.applicationNo}
            </h1>
            <p className="text-sm text-gray-500 capitalize">{type} Application</p>
          </div>
        </div>
        <Badge status={app.status} label={statusLabel(app.status, type)} size="lg" />
      </div>

      {/* Status Timeline */}
      <Card title="Application Status">
        {isRejected ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Application Rejected</p>
              <p className="text-sm text-red-600">Your application could not be shortlisted at this time.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-4">
            {statusTimeline.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= currentStatusIdx;
              const isCurrent = idx === currentStatusIdx;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs text-center ${isActive ? "font-medium text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < statusTimeline.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${idx < currentStatusIdx ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </Card>

      {/* Auto-Screening Result */}
      {app.autoScreenScore != null && (
        <Card title="Screening Result">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-700">{app.autoScreenScore}%</p>
              <p className="text-sm text-gray-500">Auto-Screen Score</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Badge status={app.autoScreenResult === "eligible" ? "shortlisted" : "rejected"} label={app.autoScreenResult || "—"} />
              <p className="text-sm text-gray-500 mt-2">Result</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Details</p>
              {app.autoScreenDetails && (() => {
                try {
                  const details = typeof app.autoScreenDetails === "string" ? JSON.parse(app.autoScreenDetails) : app.autoScreenDetails;
                  return (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {details.remarks?.map((r: string, i: number) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  );
                } catch {
                  return <p className="text-xs text-gray-500">{String(app.autoScreenDetails)}</p>;
                }
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Personal Details */}
      <Card title="Personal Details">
        <Section title="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <Field label="Name" value={`${app.title} ${app.fullName}`} />
            <Field label="Father's/Mother's/Spouse Name" value={app.fatherMotherSpouseName} />
            <Field label="Date of Birth" value={app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString("en-IN") : "—"} />
            <Field label="Gender" value={app.gender} />
            <Field label="Nationality" value={app.nationality} />
            <Field label="Aadhaar No." value={app.aadhaarNo} />
            <Field label="Contact No." value={app.contactNo} />
            <Field label="Email" value={app.emailId} />
            <Field label="Permanent Address" value={app.permanentAddress || app.personalAddress} />
            <Field label="Correspondence Address" value={app.correspondenceAddress} />
          </div>
        </Section>

        {app.isRetiredPerson && (
          <Section title="Retirement Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <Field label="Retirement Date" value={app.retirementDate ? new Date(app.retirementDate).toLocaleDateString("en-IN") : "—"} />
              <Field label="Last Organization" value={app.lastOrganization} />
              <Field label="Last Designation" value={app.lastDesignation} />
              <Field label="PPO Number" value={app.ppoNumber} />
            </div>
          </Section>
        )}
      </Card>

      {/* Empanelment-specific details */}
      {type === "empanelment" && (
        <Card title="Empanelment Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <Field label="Category Applied" value={app.categoryApplied} />
            <Field label="Service Type" value={app.serviceType} />
            <Field label="Domain(s)" value={app.domains ? domainNames(app.domains) : "—"} />
            <Field label="Areas of Expertise" value={app.areasOfExpertise} />
            <Field label="Preferred Office 1" value={app.preferredOffice1 ? officeName(app.preferredOffice1) : "—"} />
            <Field label="Preferred Office 2" value={app.preferredOffice2 ? officeName(app.preferredOffice2) : "—"} />
            <Field label="Preferred Office 3" value={app.preferredOffice3 ? officeName(app.preferredOffice3) : "—"} />
            <Field label="Willing to Work Anywhere" value={app.willingToWorkAnywhere ? "Yes" : "No"} />
          </div>
        </Card>
      )}

      {/* Engagement-specific: Post details */}
      {type === "engagement" && (
        <Card title="Post Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <Field label="Post Applied For" value={app.postAppliedFor} />
            <Field label="Also Applied for Empanelment" value={app.alsoApplyEmpanelment ? "Yes" : "No"} />
          </div>
        </Card>
      )}

      {/* Qualifications */}
      <Card title="Educational Qualifications">
        {(app.qualifications || []).length === 0 ? (
          <p className="text-sm text-gray-400">No qualifications recorded</p>
        ) : (
          <div className="space-y-4">
            {(app.qualifications || []).map((q: AppData, i: number) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Degree" value={q.degree} />
                  <Field label="Discipline" value={q.discipline} />
                  <Field label="College" value={q.collegeName} />
                  <Field label="University" value={q.universityInstitution} />
                  <Field label="Year of Passing" value={q.yearOfPassing} />
                  <Field label="Marks/CGPA" value={q.marksPercentage ? `${q.marksPercentage}%` : q.cgpa || "—"} />
                </div>
                {q.isHighestQualification && (
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Highest Qualification
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Experience */}
      <Card title="Work Experience">
        {(app.experiences || []).length === 0 ? (
          <p className="text-sm text-gray-400">No experience records</p>
        ) : (
          <div className="space-y-4">
            {(app.experiences || []).map((e: AppData, i: number) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Organization" value={e.organizationName} />
                  <Field label="Designation" value={e.designation} />
                  <Field
                    label="Period"
                    value={`${new Date(e.startDate).toLocaleDateString("en-IN")} - ${
                      e.isCurrent ? "Present" : e.endDate ? new Date(e.endDate).toLocaleDateString("en-IN") : "—"
                    }`}
                  />
                  <Field label="Sector" value={e.sectorType} />
                  <Field label="Duties" value={e.dutiesDescription} />
                  {e.remunerationPayBand && <Field label="Remuneration/Pay Band" value={e.remunerationPayBand} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Documents */}
      <Card title="Uploaded Documents">
        {(app.documents || []).length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded</p>
        ) : (
          <div className="space-y-3">
            {(app.documents || []).map((doc: AppData, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.documentName}</p>
                    <p className="text-xs text-gray-500">{doc.documentType} • {doc.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    status={doc.verificationStatus === "verified" ? "shortlisted" : doc.verificationStatus === "rejected" ? "rejected" : "submitted"}
                    label={doc.verificationStatus}
                    size="sm"
                  />
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Accept/Decline for offered status */}
      {app.status === "offered" && (
        <Card>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-green-800">You have received an offer of engagement!</p>
              <p className="text-sm text-green-600 mt-1">Please accept or decline within 7 days.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => alert("Accept functionality - to be integrated")}>
                Accept Offer
              </Button>
              <Button variant="outline" onClick={() => alert("Decline functionality - to be integrated")}>
                Decline
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
