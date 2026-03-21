"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import FileUpload from "@/components/ui/FileUpload";
import Card from "@/components/ui/Card";
import { TITLES, QUALIFICATION_LEVELS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

interface Qualification {
  id?: string;
  degree: string;
  discipline: string;
  collegeName: string;
  universityInstitution: string;
  yearOfPassing: number;
  marksPercentage: number | null;
  cgpa: number | null;
  isHighestQualification: boolean;
  certificatePath: string | null;
}

interface Experience {
  id?: string;
  organizationName: string;
  designation: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  remunerationPayBand: string | null;
  dutiesDescription: string;
  sectorType: string;
  certificatePath: string | null;
}

interface ProfileData {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  fatherMotherSpouseName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  aadhaarNo: string;
  contactNo: string;
  alternateContactNo: string | null;
  permanentAddress: string;
  correspondenceAddress: string;
  photoPath: string | null;
  cvPath: string | null;
  aadhaarDocPath: string | null;
  dobProofPath: string | null;
  isRetiredPerson: boolean;
  retirementDate: string | null;
  lastOrganization: string | null;
  lastDesignation: string | null;
  ppoNumber: string | null;
  ppoDocPath: string | null;
  isComplete: boolean;
  qualifications: Qualification[];
  experiences: Experience[];
}

type EditSection = "personal" | "qualifications" | "experience" | "documents" | null;

// ─── Helper ─────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

// ─── Component ──────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editSection, setEditSection] = useState<EditSection>(null);

  // Editable copies
  const [editPersonal, setEditPersonal] = useState<Partial<ProfileData>>({});
  const [editQualifications, setEditQualifications] = useState<Qualification[]>([]);
  const [editExperiences, setEditExperiences] = useState<Experience[]>([]);
  const [editDocPaths, setEditDocPaths] = useState<{
    photoPath: string;
    cvPath: string;
    aadhaarDocPath: string;
    dobProofPath: string;
    ppoDocPath: string;
  }>({
    photoPath: "",
    cvPath: "",
    aadhaarDocPath: "",
    dobProofPath: "",
    ppoDocPath: "",
  });

  // ─── Auth helper ──────────────────────────────────────────

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const getAuthHeadersMultipart = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token") || "";
    return { Authorization: `Bearer ${token}` };
  }, []);

  // ─── Fetch Profile ───────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) {
        setProfile(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load profile.");
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Upload helper ────────────────────────────────────────

  const uploadFile = async (
    file: File,
    documentType: string
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("documentName", file.name);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: getAuthHeadersMultipart(),
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }

    const data = await res.json();
    return data.file.filePath;
  };

  // ─── Save Profile ────────────────────────────────────────

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const mergedPersonal = editSection === "personal" ? editPersonal : {};
      const mergedQualifications =
        editSection === "qualifications" ? editQualifications : profile.qualifications;
      const mergedExperiences =
        editSection === "experience" ? editExperiences : profile.experiences;
      const mergedDocs =
        editSection === "documents" ? editDocPaths : {
          photoPath: profile.photoPath || "",
          cvPath: profile.cvPath || "",
          aadhaarDocPath: profile.aadhaarDocPath || "",
          dobProofPath: profile.dobProofPath || "",
          ppoDocPath: profile.ppoDocPath || "",
        };

      const baseProfile = {
        title: profile.title,
        fullName: profile.fullName,
        fatherMotherSpouseName: profile.fatherMotherSpouseName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        nationality: profile.nationality,
        aadhaarNo: profile.aadhaarNo,
        contactNo: profile.contactNo,
        alternateContactNo: profile.alternateContactNo,
        permanentAddress: profile.permanentAddress,
        correspondenceAddress: profile.correspondenceAddress,
        isRetiredPerson: profile.isRetiredPerson,
        retirementDate: profile.retirementDate,
        lastOrganization: profile.lastOrganization,
        lastDesignation: profile.lastDesignation,
        ppoNumber: profile.ppoNumber,
      };

      const payload = {
        ...baseProfile,
        ...mergedPersonal,
        photoPath: mergedDocs.photoPath || undefined,
        cvPath: mergedDocs.cvPath || undefined,
        aadhaarDocPath: mergedDocs.aadhaarDocPath || undefined,
        dobProofPath: mergedDocs.dobProofPath || undefined,
        ppoDocPath: mergedDocs.ppoDocPath || undefined,
        qualifications: mergedQualifications.map((q) => ({
          degree: q.degree,
          discipline: q.discipline,
          collegeName: q.collegeName,
          universityInstitution: q.universityInstitution,
          yearOfPassing: Number(q.yearOfPassing),
          marksPercentage: q.marksPercentage ? Number(q.marksPercentage) : undefined,
          cgpa: q.cgpa ? Number(q.cgpa) : undefined,
          isHighestQualification: q.isHighestQualification,
          certificatePath: q.certificatePath || undefined,
        })),
        experiences: mergedExperiences.map((e) => ({
          organizationName: e.organizationName,
          designation: e.designation,
          startDate: e.startDate,
          endDate: e.endDate || undefined,
          isCurrent: e.isCurrent,
          remunerationPayBand: e.remunerationPayBand || undefined,
          dutiesDescription: e.dutiesDescription,
          sectorType: e.sectorType,
          certificatePath: e.certificatePath || undefined,
        })),
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile.");
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
      setEditSection(null);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Start Editing ────────────────────────────────────────

  const startEditPersonal = () => {
    if (!profile) return;
    setEditPersonal({
      title: profile.title,
      fullName: profile.fullName,
      fatherMotherSpouseName: profile.fatherMotherSpouseName,
      dateOfBirth: toInputDate(profile.dateOfBirth),
      gender: profile.gender,
      nationality: profile.nationality,
      aadhaarNo: profile.aadhaarNo,
      contactNo: profile.contactNo,
      alternateContactNo: profile.alternateContactNo,
      permanentAddress: profile.permanentAddress,
      correspondenceAddress: profile.correspondenceAddress,
      isRetiredPerson: profile.isRetiredPerson,
      retirementDate: profile.retirementDate ? toInputDate(profile.retirementDate) : null,
      lastOrganization: profile.lastOrganization,
      lastDesignation: profile.lastDesignation,
      ppoNumber: profile.ppoNumber,
    });
    setEditSection("personal");
  };

  const startEditQualifications = () => {
    if (!profile) return;
    setEditQualifications(
      profile.qualifications.map((q) => ({ ...q }))
    );
    setEditSection("qualifications");
  };

  const startEditExperience = () => {
    if (!profile) return;
    setEditExperiences(
      profile.experiences.map((e) => ({
        ...e,
        startDate: toInputDate(e.startDate),
        endDate: e.endDate ? toInputDate(e.endDate) : "",
      }))
    );
    setEditSection("experience");
  };

  const startEditDocuments = () => {
    if (!profile) return;
    setEditDocPaths({
      photoPath: profile.photoPath || "",
      cvPath: profile.cvPath || "",
      aadhaarDocPath: profile.aadhaarDocPath || "",
      dobProofPath: profile.dobProofPath || "",
      ppoDocPath: profile.ppoDocPath || "",
    });
    setEditSection("documents");
  };

  // ─── Completeness ────────────────────────────────────────

  const computeCompleteness = (): number => {
    if (!profile) return 0;
    const fields = [
      profile.title,
      profile.fullName,
      profile.fatherMotherSpouseName,
      profile.dateOfBirth,
      profile.gender,
      profile.aadhaarNo,
      profile.contactNo,
      profile.permanentAddress,
      profile.correspondenceAddress,
      profile.photoPath,
      profile.cvPath,
      profile.aadhaarDocPath,
      profile.dobProofPath,
      profile.qualifications.length > 0 ? "has" : "",
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  // ─── Render: Loading / No Profile ─────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No profile found. Please complete your registration to create a profile.
            </p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/auth/register")}
            >
              Complete Registration
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const completeness = computeCompleteness();

  // ─── Render: Profile View ─────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {profile.isComplete && (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Complete
          </span>
        )}
      </div>

      {/* Completeness Bar */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Profile Completeness
          </span>
          <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completeness === 100
                  ? "bg-green-500"
                  : completeness >= 70
                  ? "bg-blue-500"
                  : completeness >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">{completeness}%</span>
        </div>
      </Card>

      {/* Notifications */}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ─── Personal Details Section ──────────────────────── */}
      <Card
        title="Personal Details"
        actions={
          editSection !== "personal" ? (
            <Button variant="outline" size="sm" onClick={startEditPersonal}>
              Edit
            </Button>
          ) : undefined
        }
      >
        {editSection === "personal" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Title"
                name="edit-title"
                value={(editPersonal.title as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, title: e.target.value }))
                }
                options={TITLES.map((t) => ({ value: t, label: t }))}
                required
              />
              <Input
                label="Full Name"
                name="edit-fullName"
                value={(editPersonal.fullName as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, fullName: e.target.value }))
                }
                required
              />
              <Input
                label="Father/Mother/Spouse Name"
                name="edit-fatherName"
                value={(editPersonal.fatherMotherSpouseName as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({
                    ...p,
                    fatherMotherSpouseName: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="Date of Birth"
                name="edit-dob"
                type="date"
                value={(editPersonal.dateOfBirth as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))
                }
                required
              />
              <Select
                label="Gender"
                name="edit-gender"
                value={(editPersonal.gender as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, gender: e.target.value }))
                }
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                required
              />
              <Input
                label="Nationality"
                name="edit-nationality"
                value={(editPersonal.nationality as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, nationality: e.target.value }))
                }
                required
              />
              <Input
                label="Aadhaar No."
                name="edit-aadhaar"
                value={(editPersonal.aadhaarNo as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, aadhaarNo: e.target.value }))
                }
                required
              />
              <Input
                label="Contact No."
                name="edit-contact"
                value={(editPersonal.contactNo as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({ ...p, contactNo: e.target.value }))
                }
                required
              />
              <Input
                label="Alternate Contact"
                name="edit-altContact"
                value={(editPersonal.alternateContactNo as string) || ""}
                onChange={(e) =>
                  setEditPersonal((p) => ({
                    ...p,
                    alternateContactNo: e.target.value,
                  }))
                }
              />
            </div>
            <TextArea
              label="Permanent Address"
              name="edit-permAddress"
              value={(editPersonal.permanentAddress as string) || ""}
              onChange={(e) =>
                setEditPersonal((p) => ({
                  ...p,
                  permanentAddress: e.target.value,
                }))
              }
              rows={3}
              required
            />
            <TextArea
              label="Correspondence Address"
              name="edit-corrAddress"
              value={(editPersonal.correspondenceAddress as string) || ""}
              onChange={(e) =>
                setEditPersonal((p) => ({
                  ...p,
                  correspondenceAddress: e.target.value,
                }))
              }
              rows={3}
            />

            {/* Retirement fields */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Retired Person?</label>
              <button
                type="button"
                onClick={() =>
                  setEditPersonal((p) => ({
                    ...p,
                    isRetiredPerson: !p.isRetiredPerson,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editPersonal.isRetiredPerson ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    editPersonal.isRetiredPerson
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {editPersonal.isRetiredPerson && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded border border-gray-200 bg-gray-50 p-4">
                <Input
                  label="Retirement Date"
                  name="edit-retDate"
                  type="date"
                  value={(editPersonal.retirementDate as string) || ""}
                  onChange={(e) =>
                    setEditPersonal((p) => ({
                      ...p,
                      retirementDate: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Last Organization"
                  name="edit-lastOrg"
                  value={(editPersonal.lastOrganization as string) || ""}
                  onChange={(e) =>
                    setEditPersonal((p) => ({
                      ...p,
                      lastOrganization: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Last Designation"
                  name="edit-lastDesig"
                  value={(editPersonal.lastDesignation as string) || ""}
                  onChange={(e) =>
                    setEditPersonal((p) => ({
                      ...p,
                      lastDesignation: e.target.value,
                    }))
                  }
                />
                <Input
                  label="PPO Number"
                  name="edit-ppo"
                  value={(editPersonal.ppoNumber as string) || ""}
                  onChange={(e) =>
                    setEditPersonal((p) => ({
                      ...p,
                      ppoNumber: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="primary" loading={saving} onClick={saveProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditSection(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Title <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">{profile.title}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Full Name <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">{profile.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Father/Mother/Spouse Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {profile.fatherMotherSpouseName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Date of Birth <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(profile.dateOfBirth)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Gender <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">{profile.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Nationality</dt>
              <dd className="text-sm font-medium text-gray-900">{profile.nationality}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Aadhaar No. <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">{profile.aadhaarNo}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Contact No. <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">{profile.contactNo}</dd>
            </div>
            {profile.alternateContactNo && (
              <div>
                <dt className="text-xs text-gray-500">Alternate Contact</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {profile.alternateContactNo}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Permanent Address <span className="text-red-500">*</span></dt>
              <dd className="text-sm font-medium text-gray-900">
                {profile.permanentAddress}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Correspondence Address</dt>
              <dd className="text-sm font-medium text-gray-900">
                {profile.correspondenceAddress}
              </dd>
            </div>
            {profile.isRetiredPerson && (
              <>
                <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                  <dt className="text-xs font-semibold text-gray-600">
                    Retirement Details
                  </dt>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Retirement Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(profile.retirementDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Organization</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {profile.lastOrganization || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Last Designation</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {profile.lastDesignation || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">PPO Number</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {profile.ppoNumber || "-"}
                  </dd>
                </div>
              </>
            )}
          </dl>
        )}
      </Card>

      {/* ─── Qualifications Section ────────────────────────── */}
      <Card
        title="Educational Qualifications"
        actions={
          editSection !== "qualifications" ? (
            <Button variant="outline" size="sm" onClick={startEditQualifications}>
              Edit
            </Button>
          ) : undefined
        }
      >
        {editSection === "qualifications" ? (
          <div className="space-y-5">
            {editQualifications.map((q, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Qualification #{idx + 1}
                  </h4>
                  {editQualifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditQualifications((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Select
                    label="Degree"
                    name={`eq-degree-${idx}`}
                    value={q.degree}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = { ...updated[idx], degree: e.target.value };
                      setEditQualifications(updated);
                    }}
                    options={QUALIFICATION_LEVELS.map((l) => ({
                      value: l,
                      label: l,
                    }))}
                    required
                  />
                  <Input
                    label="Discipline"
                    name={`eq-disc-${idx}`}
                    value={q.discipline}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = { ...updated[idx], discipline: e.target.value };
                      setEditQualifications(updated);
                    }}
                    required
                  />
                  <Input
                    label="College"
                    name={`eq-college-${idx}`}
                    value={q.collegeName}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = { ...updated[idx], collegeName: e.target.value };
                      setEditQualifications(updated);
                    }}
                    required
                  />
                  <Input
                    label="University"
                    name={`eq-uni-${idx}`}
                    value={q.universityInstitution}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = {
                        ...updated[idx],
                        universityInstitution: e.target.value,
                      };
                      setEditQualifications(updated);
                    }}
                    required
                  />
                  <Input
                    label="Year of Passing"
                    name={`eq-year-${idx}`}
                    type="number"
                    value={String(q.yearOfPassing || "")}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = {
                        ...updated[idx],
                        yearOfPassing: Number(e.target.value),
                      };
                      setEditQualifications(updated);
                    }}
                    required
                  />
                  <Input
                    label="Marks %"
                    name={`eq-marks-${idx}`}
                    type="number"
                    value={String(q.marksPercentage || "")}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = {
                        ...updated[idx],
                        marksPercentage: e.target.value
                          ? Number(e.target.value)
                          : null,
                      };
                      setEditQualifications(updated);
                    }}
                  />
                  <Input
                    label="CGPA"
                    name={`eq-cgpa-${idx}`}
                    type="number"
                    value={String(q.cgpa || "")}
                    onChange={(e) => {
                      const updated = [...editQualifications];
                      updated[idx] = {
                        ...updated[idx],
                        cgpa: e.target.value ? Number(e.target.value) : null,
                      };
                      setEditQualifications(updated);
                    }}
                  />
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <input
                        id={`eq-highest-${idx}`}
                        type="checkbox"
                        checked={q.isHighestQualification}
                        onChange={(e) => {
                          const updated = [...editQualifications];
                          updated[idx] = {
                            ...updated[idx],
                            isHighestQualification: e.target.checked,
                          };
                          setEditQualifications(updated);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`eq-highest-${idx}`}
                        className="text-sm text-gray-700"
                      >
                        Highest
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <FileUpload
                    documentType="qualification"
                    label="Certificate"
                    accept="image/jpeg,image/png,application/pdf"
                    onUpload={async (file) => {
                      try {
                        const path = await uploadFile(file, "qualification");
                        const updated = [...editQualifications];
                        updated[idx] = { ...updated[idx], certificatePath: path };
                        setEditQualifications(updated);
                      } catch {
                        setError("Certificate upload failed.");
                      }
                    }}
                  />
                  {q.certificatePath && (
                    <p className="mt-1 text-xs text-green-600">Certificate on file</p>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEditQualifications((prev) => [
                  ...prev,
                  {
                    degree: "",
                    discipline: "",
                    collegeName: "",
                    universityInstitution: "",
                    yearOfPassing: 0,
                    marksPercentage: null,
                    cgpa: null,
                    isHighestQualification: false,
                    certificatePath: null,
                  },
                ])
              }
            >
              + Add Qualification
            </Button>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" loading={saving} onClick={saveProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditSection(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : profile.qualifications.length === 0 ? (
          <p className="text-sm text-gray-500">No qualifications added yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {profile.qualifications.map((q, idx) => (
              <div key={q.id || idx} className={`${idx > 0 ? "pt-3" : ""} pb-3`}>
                <p className="text-sm font-medium text-gray-900">
                  {q.degree} - {q.discipline}
                  {q.isHighestQualification && (
                    <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Highest
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {q.collegeName}, {q.universityInstitution}
                </p>
                <p className="text-xs text-gray-400">
                  Year: {q.yearOfPassing}
                  {q.marksPercentage && ` | Marks: ${q.marksPercentage}%`}
                  {q.cgpa && ` | CGPA: ${q.cgpa}`}
                </p>
                {q.certificatePath && (
                  <a
                    href={`/${q.certificatePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── Experience Section ────────────────────────────── */}
      <Card
        title="Work Experience"
        actions={
          editSection !== "experience" ? (
            <Button variant="outline" size="sm" onClick={startEditExperience}>
              Edit
            </Button>
          ) : undefined
        }
      >
        {editSection === "experience" ? (
          <div className="space-y-5">
            {editExperiences.length === 0 && (
              <p className="text-sm text-gray-500">No experience entries. Click below to add.</p>
            )}

            {editExperiences.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Experience #{idx + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setEditExperiences((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Organization"
                    name={`ee-org-${idx}`}
                    value={exp.organizationName}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        organizationName: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                    required
                  />
                  <Input
                    label="Designation"
                    name={`ee-desig-${idx}`}
                    value={exp.designation}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        designation: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                    required
                  />
                  <Input
                    label="Start Date"
                    name={`ee-start-${idx}`}
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        startDate: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                    required
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        id={`ee-current-${idx}`}
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => {
                          const updated = [...editExperiences];
                          updated[idx] = {
                            ...updated[idx],
                            isCurrent: e.target.checked,
                          };
                          setEditExperiences(updated);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`ee-current-${idx}`}
                        className="text-sm text-gray-700"
                      >
                        Currently Working
                      </label>
                    </div>
                    {!exp.isCurrent && (
                      <Input
                        label="End Date"
                        name={`ee-end-${idx}`}
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) => {
                          const updated = [...editExperiences];
                          updated[idx] = {
                            ...updated[idx],
                            endDate: e.target.value,
                          };
                          setEditExperiences(updated);
                        }}
                      />
                    )}
                  </div>
                  <Input
                    label="Remuneration / Pay Band"
                    name={`ee-pay-${idx}`}
                    value={exp.remunerationPayBand || ""}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        remunerationPayBand: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                  />
                  <Select
                    label="Sector"
                    name={`ee-sector-${idx}`}
                    value={exp.sectorType}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        sectorType: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                    options={[
                      { value: "government", label: "Government" },
                      { value: "public", label: "Public Sector" },
                      { value: "private", label: "Private Sector" },
                    ]}
                    required
                  />
                </div>
                <div className="mt-3">
                  <TextArea
                    label="Duties"
                    name={`ee-duties-${idx}`}
                    value={exp.dutiesDescription}
                    onChange={(e) => {
                      const updated = [...editExperiences];
                      updated[idx] = {
                        ...updated[idx],
                        dutiesDescription: e.target.value,
                      };
                      setEditExperiences(updated);
                    }}
                    maxLength={400}
                    rows={2}
                    required
                  />
                </div>
                <div className="mt-3">
                  <FileUpload
                    documentType="experience"
                    label="Experience Certificate"
                    accept="image/jpeg,image/png,application/pdf"
                    onUpload={async (file) => {
                      try {
                        const path = await uploadFile(file, "experience");
                        const updated = [...editExperiences];
                        updated[idx] = { ...updated[idx], certificatePath: path };
                        setEditExperiences(updated);
                      } catch {
                        setError("Certificate upload failed.");
                      }
                    }}
                  />
                  {exp.certificatePath && (
                    <p className="mt-1 text-xs text-green-600">Certificate on file</p>
                  )}
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEditExperiences((prev) => [
                  ...prev,
                  {
                    organizationName: "",
                    designation: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    remunerationPayBand: "",
                    dutiesDescription: "",
                    sectorType: "",
                    certificatePath: null,
                  },
                ])
              }
            >
              + Add Experience
            </Button>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" loading={saving} onClick={saveProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditSection(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : profile.experiences.length === 0 ? (
          <p className="text-sm text-gray-500">No experience added yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {profile.experiences.map((exp, idx) => (
              <div key={exp.id || idx} className={`${idx > 0 ? "pt-3" : ""} pb-3`}>
                <p className="text-sm font-medium text-gray-900">
                  {exp.designation} at {exp.organizationName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(exp.startDate)} -{" "}
                  {exp.isCurrent ? "Present" : formatDate(exp.endDate)} |{" "}
                  {exp.sectorType}
                </p>
                {exp.remunerationPayBand && (
                  <p className="text-xs text-gray-400">
                    Pay: {exp.remunerationPayBand}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {exp.dutiesDescription}
                </p>
                {exp.certificatePath && (
                  <a
                    href={`/${exp.certificatePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── Documents Section ─────────────────────────────── */}
      <Card
        title="Documents"
        actions={
          editSection !== "documents" ? (
            <Button variant="outline" size="sm" onClick={startEditDocuments}>
              Edit
            </Button>
          ) : undefined
        }
      >
        {editSection === "documents" ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FileUpload
                  documentType="photo"
                  label="Passport Photo"
                  accept="image/jpeg,image/png"
                  maxSize={2}
                  onUpload={async (file) => {
                    try {
                      const path = await uploadFile(file, "photo");
                      setEditDocPaths((prev) => ({ ...prev, photoPath: path }));
                    } catch {
                      setError("Photo upload failed.");
                    }
                  }}
                />
                {editDocPaths.photoPath && (
                  <p className="mt-1 text-xs text-green-600">Uploaded</p>
                )}
              </div>
              <div>
                <FileUpload
                  documentType="cv"
                  label="Updated CV"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onUpload={async (file) => {
                    try {
                      const path = await uploadFile(file, "cv");
                      setEditDocPaths((prev) => ({ ...prev, cvPath: path }));
                    } catch {
                      setError("CV upload failed.");
                    }
                  }}
                />
                {editDocPaths.cvPath && (
                  <p className="mt-1 text-xs text-green-600">Uploaded</p>
                )}
              </div>
              <div>
                <FileUpload
                  documentType="aadhaar"
                  label="Aadhaar Card"
                  accept="image/jpeg,image/png,application/pdf"
                  onUpload={async (file) => {
                    try {
                      const path = await uploadFile(file, "aadhaar");
                      setEditDocPaths((prev) => ({
                        ...prev,
                        aadhaarDocPath: path,
                      }));
                    } catch {
                      setError("Aadhaar upload failed.");
                    }
                  }}
                />
                {editDocPaths.aadhaarDocPath && (
                  <p className="mt-1 text-xs text-green-600">Uploaded</p>
                )}
              </div>
              <div>
                <FileUpload
                  documentType="cv"
                  label="Date of Birth Proof"
                  accept="image/jpeg,image/png,application/pdf"
                  onUpload={async (file) => {
                    try {
                      const path = await uploadFile(file, "dob_proof");
                      setEditDocPaths((prev) => ({
                        ...prev,
                        dobProofPath: path,
                      }));
                    } catch {
                      setError("DOB proof upload failed.");
                    }
                  }}
                />
                {editDocPaths.dobProofPath && (
                  <p className="mt-1 text-xs text-green-600">Uploaded</p>
                )}
              </div>
              {profile.isRetiredPerson && (
                <div>
                  <FileUpload
                    documentType="cv"
                    label="PPO Document"
                    accept="image/jpeg,image/png,application/pdf"
                    onUpload={async (file) => {
                      try {
                        const path = await uploadFile(file, "ppo");
                        setEditDocPaths((prev) => ({
                          ...prev,
                          ppoDocPath: path,
                        }));
                      } catch {
                        setError("PPO upload failed.");
                      }
                    }}
                  />
                  {editDocPaths.ppoDocPath && (
                    <p className="mt-1 text-xs text-green-600">Uploaded</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" loading={saving} onClick={saveProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditSection(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "Passport Photo", path: profile.photoPath, mandatory: true },
              { label: "Updated CV", path: profile.cvPath, mandatory: true },
              { label: "Aadhaar Card", path: profile.aadhaarDocPath, mandatory: true },
              { label: "DOB Proof", path: profile.dobProofPath, mandatory: true },
              ...(profile.isRetiredPerson
                ? [{ label: "PPO Document", path: profile.ppoDocPath, mandatory: false }]
                : []),
            ].map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {doc.label}
                    {doc.mandatory && (
                      <span className="ml-1 text-red-500 text-xs">*</span>
                    )}
                  </p>
                  {doc.path ? (
                    <a
                      href={`/${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View / Download
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">Not uploaded</p>
                  )}
                </div>
                {doc.path ? (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-gray-400 pb-4">
        Fields marked with <span className="text-red-500">*</span> are mandatory.
      </p>
    </div>
  );
}
