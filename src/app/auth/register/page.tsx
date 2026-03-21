"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import FileUpload from "@/components/ui/FileUpload";
import Card from "@/components/ui/Card";
import { TITLES, QUALIFICATION_LEVELS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────

interface QualificationEntry {
  degree: string;
  discipline: string;
  collegeName: string;
  universityInstitution: string;
  yearOfPassing: string;
  marksPercentage: string;
  cgpa: string;
  isHighestQualification: boolean;
  certificatePath: string;
}

interface ExperienceEntry {
  organizationName: string;
  designation: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  remunerationPayBand: string;
  dutiesDescription: string;
  sectorType: string;
  certificatePath: string;
}

interface PersonalDetails {
  title: string;
  fullName: string;
  fatherMotherSpouseName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  aadhaarNo: string;
  contactNo: string;
  alternateContactNo: string;
  permanentAddress: string;
  correspondenceAddress: string;
  sameAsPermAddress: boolean;
  photoPath: string;
  aadhaarDocPath: string;
  dobProofPath: string;
  isRetiredPerson: boolean;
  retirementDate: string;
  lastOrganization: string;
  lastDesignation: string;
  ppoNumber: string;
  ppoDocPath: string;
}

interface AccountForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STORAGE_KEY = "npc-registration-draft";

const STEPS = [
  "Account Setup",
  "Personal Details",
  "Educational Qualifications",
  "Work Experience",
  "Review & Complete",
];

const emptyQualification = (): QualificationEntry => ({
  degree: "",
  discipline: "",
  collegeName: "",
  universityInstitution: "",
  yearOfPassing: "",
  marksPercentage: "",
  cgpa: "",
  isHighestQualification: false,
  certificatePath: "",
});

const emptyExperience = (): ExperienceEntry => ({
  organizationName: "",
  designation: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  remunerationPayBand: "",
  dutiesDescription: "",
  sectorType: "",
  certificatePath: "",
});

// ─── Component ────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1
  const [account, setAccount] = useState<AccountForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [accountCreated, setAccountCreated] = useState(false);
  const [token, setToken] = useState("");

  // Step 2
  const [personal, setPersonal] = useState<PersonalDetails>({
    title: "Mr.",
    fullName: "",
    fatherMotherSpouseName: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "Indian",
    aadhaarNo: "",
    contactNo: "",
    alternateContactNo: "",
    permanentAddress: "",
    correspondenceAddress: "",
    sameAsPermAddress: false,
    photoPath: "",
    aadhaarDocPath: "",
    dobProofPath: "",
    isRetiredPerson: false,
    retirementDate: "",
    lastOrganization: "",
    lastDesignation: "",
    ppoNumber: "",
    ppoDocPath: "",
  });

  // Step 3
  const [qualifications, setQualifications] = useState<QualificationEntry[]>([
    emptyQualification(),
  ]);

  // Step 4
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [cvPath, setCvPath] = useState("");

  // ─── Auto-save to localStorage ────────────────────────────

  const saveDraft = useCallback(() => {
    if (!accountCreated) return;
    try {
      const draft = { personal, qualifications, experiences, cvPath, currentStep };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [personal, qualifications, experiences, cvPath, currentStep, accountCreated]);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.personal) setPersonal(draft.personal);
        if (draft.qualifications) setQualifications(draft.qualifications);
        if (draft.experiences) setExperiences(draft.experiences);
        if (draft.cvPath) setCvPath(draft.cvPath);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ─── File upload helper ───────────────────────────────────

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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }

    const data = await res.json();
    return data.file.filePath;
  };

  // ─── Step 1: Account Setup ───────────────────────────────

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validateStep1 = (): boolean => {
    if (
      !account.name ||
      !account.email ||
      !account.password ||
      !account.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return false;
    }
    if (account.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    if (account.password !== account.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const submitStep1 = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setError("");
    try {
      // Register account
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          password: account.password,
          role: "applicant",
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error || "Registration failed.");
        return;
      }

      // Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError("Account created. Please log in to continue.");
        router.push("/auth/login?registered=true");
        return;
      }

      setToken(loginData.token);
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      setAccountCreated(true);
      setPersonal((prev) => ({ ...prev, fullName: account.name }));
      setCurrentStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Personal Details ─────────────────────────────

  const handlePersonalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setPersonal((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePersonalCheckbox = (name: string, checked: boolean) => {
    setPersonal((prev) => {
      const updated = { ...prev, [name]: checked };
      if (name === "sameAsPermAddress" && checked) {
        updated.correspondenceAddress = prev.permanentAddress;
      }
      return updated;
    });
  };

  const validateStep2 = (): boolean => {
    if (!personal.title) {
      setError("Please select a title.");
      return false;
    }
    if (!personal.fullName) {
      setError("Full name is required.");
      return false;
    }
    if (!personal.fatherMotherSpouseName) {
      setError("Father's/Mother's/Husband's name is required.");
      return false;
    }
    if (!personal.dateOfBirth) {
      setError("Date of birth is required.");
      return false;
    }
    if (!personal.gender) {
      setError("Gender is required.");
      return false;
    }
    if (!personal.aadhaarNo || !/^\d{12}$/.test(personal.aadhaarNo)) {
      setError("Aadhaar number must be exactly 12 digits.");
      return false;
    }
    if (!personal.contactNo || !/^\d{10}$/.test(personal.contactNo)) {
      setError("Contact number must be exactly 10 digits.");
      return false;
    }
    if (!personal.permanentAddress) {
      setError("Permanent address is required.");
      return false;
    }
    return true;
  };

  // ─── Step 3: Qualifications ───────────────────────────────

  const updateQualification = (
    idx: number,
    field: keyof QualificationEntry,
    value: string | boolean
  ) => {
    setQualifications((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addQualification = () => {
    setQualifications((prev) => [...prev, emptyQualification()]);
  };

  const removeQualification = (idx: number) => {
    if (qualifications.length <= 1) return;
    setQualifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateStep3 = (): boolean => {
    if (qualifications.length === 0) {
      setError("At least one qualification is required.");
      return false;
    }
    for (let i = 0; i < qualifications.length; i++) {
      const q = qualifications[i];
      if (!q.degree || !q.discipline || !q.collegeName || !q.universityInstitution || !q.yearOfPassing) {
        setError(`Please fill all required fields for qualification #${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  // ─── Step 4: Experience ───────────────────────────────────

  const updateExperience = (
    idx: number,
    field: keyof ExperienceEntry,
    value: string | boolean
  ) => {
    setExperiences((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addExperience = () => {
    setExperiences((prev) => [...prev, emptyExperience()]);
  };

  const removeExperience = (idx: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateStep4 = (): boolean => {
    for (let i = 0; i < experiences.length; i++) {
      const e = experiences[i];
      if (
        !e.organizationName ||
        !e.designation ||
        !e.startDate ||
        !e.dutiesDescription ||
        !e.sectorType
      ) {
        setError(`Please fill all required fields for experience #${i + 1}.`);
        return false;
      }
      if (!e.isCurrent && !e.endDate) {
        setError(`Please provide an end date for experience #${i + 1} or mark as current.`);
        return false;
      }
    }
    return true;
  };

  // ─── Step 5: Submit ───────────────────────────────────────

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: personal.title,
        fullName: personal.fullName,
        fatherMotherSpouseName: personal.fatherMotherSpouseName,
        dateOfBirth: new Date(personal.dateOfBirth).toISOString(),
        gender: personal.gender,
        nationality: personal.nationality,
        aadhaarNo: personal.aadhaarNo,
        contactNo: personal.contactNo,
        alternateContactNo: personal.alternateContactNo || undefined,
        permanentAddress: personal.permanentAddress,
        correspondenceAddress: personal.correspondenceAddress,
        photoPath: personal.photoPath || undefined,
        cvPath: cvPath || undefined,
        aadhaarDocPath: personal.aadhaarDocPath || undefined,
        dobProofPath: personal.dobProofPath || undefined,
        isRetiredPerson: personal.isRetiredPerson,
        retirementDate: personal.retirementDate
          ? new Date(personal.retirementDate).toISOString()
          : undefined,
        lastOrganization: personal.lastOrganization || undefined,
        lastDesignation: personal.lastDesignation || undefined,
        ppoNumber: personal.ppoNumber || undefined,
        ppoDocPath: personal.ppoDocPath || undefined,
        qualifications: qualifications.map((q) => ({
          degree: q.degree,
          discipline: q.discipline,
          collegeName: q.collegeName,
          universityInstitution: q.universityInstitution,
          yearOfPassing: Number(q.yearOfPassing),
          marksPercentage: q.marksPercentage
            ? Number(q.marksPercentage)
            : undefined,
          cgpa: q.cgpa ? Number(q.cgpa) : undefined,
          isHighestQualification: q.isHighestQualification,
          certificatePath: q.certificatePath || undefined,
        })),
        experiences: experiences.map((e) => ({
          organizationName: e.organizationName,
          designation: e.designation,
          startDate: new Date(e.startDate).toISOString(),
          endDate: e.endDate
            ? new Date(e.endDate).toISOString()
            : undefined,
          isCurrent: e.isCurrent,
          remunerationPayBand: e.remunerationPayBand || undefined,
          dutiesDescription: e.dutiesDescription,
          sectorType: e.sectorType,
          certificatePath: e.certificatePath || undefined,
        })),
      };

      const authToken = token || localStorage.getItem("token") || "";
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save profile.");
        return;
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Navigation ───────────────────────────────────────────

  const goNext = () => {
    setError("");
    if (currentStep === 1) {
      submitStep1();
      return;
    }
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    if (currentStep === 5) {
      handleComplete();
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => {
    setError("");
    if (currentStep === 1) return;
    // Don't allow going back to step 1 after account creation
    if (currentStep === 2 && accountCreated) return;
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step === 1 && accountCreated) return;
    setError("");
    setCurrentStep(step);
  };

  // ─── Progress Bar ─────────────────────────────────────────

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          return (
            <React.Fragment key={stepNum}>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isCompleted && goToStep(stepNum)}
                  disabled={!isCompleted}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : isCompleted
                      ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </button>
                <span
                  className={`mt-1.5 text-xs font-medium text-center hidden sm:block ${
                    isActive ? "text-blue-700" : isCompleted ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    stepNum < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // ─── Step 1 Render ────────────────────────────────────────

  const renderStep1 = () => (
    <Card title="Step 1: Account Setup">
      <div className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={account.name}
          onChange={handleAccountChange}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={account.email}
          onChange={handleAccountChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          value={account.password}
          onChange={handleAccountChange}
          required
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={account.confirmPassword}
          onChange={handleAccountChange}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <div className="rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700">
            Applicant
          </div>
          <p className="text-xs text-gray-500">
            Self-registration is available for applicants only. Other roles are
            assigned by administrators.
          </p>
        </div>
      </div>
    </Card>
  );

  // ─── Step 2 Render ────────────────────────────────────────

  const renderStep2 = () => (
    <Card title="Step 2: Personal Details">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            label="Title"
            name="title"
            value={personal.title}
            onChange={handlePersonalChange}
            options={TITLES.map((t) => ({ value: t, label: t }))}
            required
          />
          <Input
            label="Full Name"
            name="fullName"
            value={personal.fullName}
            onChange={handlePersonalChange}
            required
          />
        </div>

        <Input
          label="Father's / Mother's / Husband's Name"
          name="fatherMotherSpouseName"
          value={personal.fatherMotherSpouseName}
          onChange={handlePersonalChange}
          required
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Input
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={personal.dateOfBirth}
            onChange={handlePersonalChange}
            required
          />
          <Select
            label="Gender"
            name="gender"
            value={personal.gender}
            onChange={handlePersonalChange}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
            required
          />
          <Input
            label="Nationality"
            name="nationality"
            value={personal.nationality}
            onChange={handlePersonalChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Input
            label="Aadhaar No. (12 digits)"
            name="aadhaarNo"
            value={personal.aadhaarNo}
            onChange={handlePersonalChange}
            placeholder="123456789012"
            required
          />
          <Input
            label="Contact No. (10 digits)"
            name="contactNo"
            value={personal.contactNo}
            onChange={handlePersonalChange}
            placeholder="9876543210"
            required
          />
          <Input
            label="Alternate Contact No."
            name="alternateContactNo"
            value={personal.alternateContactNo}
            onChange={handlePersonalChange}
          />
        </div>

        <TextArea
          label="Permanent Address"
          name="permanentAddress"
          value={personal.permanentAddress}
          onChange={handlePersonalChange}
          rows={3}
          required
        />

        <div className="flex items-center gap-2">
          <input
            id="sameAsPermAddress"
            type="checkbox"
            checked={personal.sameAsPermAddress}
            onChange={(e) =>
              handlePersonalCheckbox("sameAsPermAddress", e.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="sameAsPermAddress" className="text-sm text-gray-700">
            Correspondence address same as permanent address
          </label>
        </div>

        {!personal.sameAsPermAddress && (
          <TextArea
            label="Correspondence Address"
            name="correspondenceAddress"
            value={personal.correspondenceAddress}
            onChange={handlePersonalChange}
            rows={3}
          />
        )}

        {/* Document Uploads */}
        <div className="border-t border-gray-200 pt-5">
          <h4 className="mb-4 text-sm font-semibold text-gray-800">
            Document Uploads
          </h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FileUpload
                documentType="photo"
                label="Passport Photo"
                accept="image/jpeg,image/png,image/jpg"
                maxSize={2}
                onUpload={async (file) => {
                  try {
                    const path = await uploadFile(file, "photo");
                    setPersonal((prev) => ({ ...prev, photoPath: path }));
                  } catch {
                    setError("Photo upload failed.");
                  }
                }}
              />
              {personal.photoPath && (
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
                    setPersonal((prev) => ({ ...prev, aadhaarDocPath: path }));
                  } catch {
                    setError("Aadhaar upload failed.");
                  }
                }}
              />
              {personal.aadhaarDocPath && (
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
                    setPersonal((prev) => ({ ...prev, dobProofPath: path }));
                  } catch {
                    setError("DOB proof upload failed.");
                  }
                }}
              />
              {personal.dobProofPath && (
                <p className="mt-1 text-xs text-green-600">Uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Retirement Toggle */}
        <div className="border-t border-gray-200 pt-5">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">
              Are you a retired person?
            </label>
            <button
              type="button"
              onClick={() =>
                setPersonal((prev) => ({
                  ...prev,
                  isRetiredPerson: !prev.isRetiredPerson,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                personal.isRetiredPerson ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  personal.isRetiredPerson ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {personal.isRetiredPerson ? "Yes" : "No"}
            </span>
          </div>

          {personal.isRetiredPerson && (
            <div className="space-y-4 rounded border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Retirement Date"
                  name="retirementDate"
                  type="date"
                  value={personal.retirementDate}
                  onChange={handlePersonalChange}
                />
                <Input
                  label="Last Organization"
                  name="lastOrganization"
                  value={personal.lastOrganization}
                  onChange={handlePersonalChange}
                />
                <Input
                  label="Last Designation"
                  name="lastDesignation"
                  value={personal.lastDesignation}
                  onChange={handlePersonalChange}
                />
                <Input
                  label="PPO Number"
                  name="ppoNumber"
                  value={personal.ppoNumber}
                  onChange={handlePersonalChange}
                />
              </div>
              <FileUpload
                documentType="cv"
                label="PPO Document Upload"
                accept="image/jpeg,image/png,application/pdf"
                onUpload={async (file) => {
                  try {
                    const path = await uploadFile(file, "ppo");
                    setPersonal((prev) => ({ ...prev, ppoDocPath: path }));
                  } catch {
                    setError("PPO upload failed.");
                  }
                }}
              />
              {personal.ppoDocPath && (
                <p className="text-xs text-green-600">Uploaded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // ─── Step 3 Render ────────────────────────────────────────

  const renderStep3 = () => (
    <Card title="Step 3: Educational Qualifications">
      <p className="mb-4 text-sm text-gray-500">
        Upload certificate inline with each qualification. Key details help in auto-screening.
      </p>

      <div className="space-y-6">
        {qualifications.map((q, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Qualification #{idx + 1}
              </h4>
              {qualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQualification(idx)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Degree"
                name={`qual-degree-${idx}`}
                value={q.degree}
                onChange={(e) =>
                  updateQualification(idx, "degree", e.target.value)
                }
                options={QUALIFICATION_LEVELS.map((l) => ({
                  value: l,
                  label: l,
                }))}
                placeholder="Select degree"
                required
              />
              <Input
                label="Discipline / Subject"
                name={`qual-discipline-${idx}`}
                value={q.discipline}
                onChange={(e) =>
                  updateQualification(idx, "discipline", e.target.value)
                }
                required
              />
              <Input
                label="College / Institute"
                name={`qual-college-${idx}`}
                value={q.collegeName}
                onChange={(e) =>
                  updateQualification(idx, "collegeName", e.target.value)
                }
                required
              />
              <Input
                label="University / Institution"
                name={`qual-university-${idx}`}
                value={q.universityInstitution}
                onChange={(e) =>
                  updateQualification(
                    idx,
                    "universityInstitution",
                    e.target.value
                  )
                }
                required
              />
              <Input
                label="Year of Passing"
                name={`qual-year-${idx}`}
                type="number"
                value={q.yearOfPassing}
                onChange={(e) =>
                  updateQualification(idx, "yearOfPassing", e.target.value)
                }
                required
              />
              <Input
                label="Marks Percentage"
                name={`qual-marks-${idx}`}
                type="number"
                value={q.marksPercentage}
                onChange={(e) =>
                  updateQualification(idx, "marksPercentage", e.target.value)
                }
              />
              <Input
                label="CGPA"
                name={`qual-cgpa-${idx}`}
                type="number"
                value={q.cgpa}
                onChange={(e) =>
                  updateQualification(idx, "cgpa", e.target.value)
                }
              />
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <input
                    id={`qual-highest-${idx}`}
                    type="checkbox"
                    checked={q.isHighestQualification}
                    onChange={(e) =>
                      updateQualification(
                        idx,
                        "isHighestQualification",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`qual-highest-${idx}`}
                    className="text-sm text-gray-700"
                  >
                    Highest Qualification
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <FileUpload
                documentType="qualification"
                label="Certificate Upload"
                accept="image/jpeg,image/png,application/pdf"
                onUpload={async (file) => {
                  try {
                    const path = await uploadFile(file, "qualification");
                    updateQualification(idx, "certificatePath", path);
                  } catch {
                    setError("Certificate upload failed.");
                  }
                }}
              />
              {q.certificatePath && (
                <p className="mt-1 text-xs text-green-600">Uploaded</p>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addQualification}>
          + Add Qualification
        </Button>
      </div>
    </Card>
  );

  // ─── Step 4 Render ────────────────────────────────────────

  const renderStep4 = () => (
    <Card title="Step 4: Work Experience">
      <div className="space-y-6">
        {experiences.length === 0 && (
          <p className="text-sm text-gray-500">
            No experience entries added yet. Click below to add your work experience.
          </p>
        )}

        {experiences.map((exp, idx) => (
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
                onClick={() => removeExperience(idx)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Organization Name"
                name={`exp-org-${idx}`}
                value={exp.organizationName}
                onChange={(e) =>
                  updateExperience(idx, "organizationName", e.target.value)
                }
                required
              />
              <Input
                label="Designation"
                name={`exp-desig-${idx}`}
                value={exp.designation}
                onChange={(e) =>
                  updateExperience(idx, "designation", e.target.value)
                }
                required
              />
              <Input
                label="Start Date"
                name={`exp-start-${idx}`}
                type="date"
                value={exp.startDate}
                onChange={(e) =>
                  updateExperience(idx, "startDate", e.target.value)
                }
                required
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <input
                    id={`exp-current-${idx}`}
                    type="checkbox"
                    checked={exp.isCurrent}
                    onChange={(e) =>
                      updateExperience(idx, "isCurrent", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`exp-current-${idx}`}
                    className="text-sm text-gray-700"
                  >
                    Currently Working
                  </label>
                </div>
                {!exp.isCurrent && (
                  <Input
                    label="End Date"
                    name={`exp-end-${idx}`}
                    type="date"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(idx, "endDate", e.target.value)
                    }
                    required
                  />
                )}
              </div>
              <Input
                label="Remuneration / Pay Band"
                name={`exp-pay-${idx}`}
                value={exp.remunerationPayBand}
                onChange={(e) =>
                  updateExperience(idx, "remunerationPayBand", e.target.value)
                }
              />
              <Select
                label="Sector Type"
                name={`exp-sector-${idx}`}
                value={exp.sectorType}
                onChange={(e) =>
                  updateExperience(idx, "sectorType", e.target.value)
                }
                options={[
                  { value: "government", label: "Government" },
                  { value: "public", label: "Public Sector" },
                  { value: "private", label: "Private Sector" },
                ]}
                placeholder="Select sector"
                required
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Duties / Responsibilities"
                name={`exp-duties-${idx}`}
                value={exp.dutiesDescription}
                onChange={(e) =>
                  updateExperience(idx, "dutiesDescription", e.target.value)
                }
                maxLength={400}
                rows={3}
                required
              />
            </div>

            <div className="mt-4">
              <FileUpload
                documentType="experience"
                label="Experience Certificate"
                accept="image/jpeg,image/png,application/pdf"
                onUpload={async (file) => {
                  try {
                    const path = await uploadFile(file, "experience");
                    updateExperience(idx, "certificatePath", path);
                  } catch {
                    setError("Certificate upload failed.");
                  }
                }}
              />
              {exp.certificatePath && (
                <p className="mt-1 text-xs text-green-600">Uploaded</p>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addExperience}>
          + Add Experience
        </Button>

        <div className="border-t border-gray-200 pt-5">
          <FileUpload
            documentType="cv"
            label="Upload Updated CV (PDF/DOC)"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onUpload={async (file) => {
              try {
                const path = await uploadFile(file, "cv");
                setCvPath(path);
              } catch {
                setError("CV upload failed.");
              }
            }}
          />
          {cvPath && (
            <p className="mt-1 text-xs text-green-600">CV uploaded</p>
          )}
        </div>
      </div>
    </Card>
  );

  // ─── Step 5 Render (Review) ───────────────────────────────

  const renderStep5 = () => (
    <div className="space-y-6">
      {/* Personal Details Summary */}
      <Card
        title="Personal Details"
        actions={
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Edit
          </button>
        }
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Title</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.title}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Full Name</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Father/Mother/Spouse Name</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.fatherMotherSpouseName}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Date of Birth</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.dateOfBirth}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Gender</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.gender}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Nationality</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.nationality}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Aadhaar No.</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.aadhaarNo}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Contact No.</dt>
            <dd className="text-sm font-medium text-gray-900">{personal.contactNo}</dd>
          </div>
          {personal.alternateContactNo && (
            <div>
              <dt className="text-xs text-gray-500">Alternate Contact</dt>
              <dd className="text-sm font-medium text-gray-900">
                {personal.alternateContactNo}
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Permanent Address</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.permanentAddress}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-gray-500">Correspondence Address</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.sameAsPermAddress
                ? personal.permanentAddress
                : personal.correspondenceAddress}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Photo</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.photoPath ? "Uploaded" : "Not uploaded"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Aadhaar Document</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.aadhaarDocPath ? "Uploaded" : "Not uploaded"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">DOB Proof</dt>
            <dd className="text-sm font-medium text-gray-900">
              {personal.dobProofPath ? "Uploaded" : "Not uploaded"}
            </dd>
          </div>
          {personal.isRetiredPerson && (
            <>
              <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                <dt className="text-xs font-semibold text-gray-600">
                  Retirement Details
                </dt>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Retirement Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {personal.retirementDate || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last Organization</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {personal.lastOrganization || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Last Designation</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {personal.lastDesignation || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">PPO Number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {personal.ppoNumber || "-"}
                </dd>
              </div>
            </>
          )}
        </dl>
      </Card>

      {/* Qualifications Summary */}
      <Card
        title="Educational Qualifications"
        actions={
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Edit
          </button>
        }
      >
        {qualifications.length === 0 ? (
          <p className="text-sm text-gray-500">No qualifications added.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {qualifications.map((q, idx) => (
              <div key={idx} className={idx > 0 ? "pt-3" : ""}>
                <div className="flex items-start justify-between">
                  <div>
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
                      {q.certificatePath && " | Certificate: Uploaded"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Experience Summary */}
      <Card
        title="Work Experience"
        actions={
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Edit
          </button>
        }
      >
        {experiences.length === 0 ? (
          <p className="text-sm text-gray-500">No experience entries added.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {experiences.map((exp, idx) => (
              <div key={idx} className={idx > 0 ? "pt-3" : ""}>
                <p className="text-sm font-medium text-gray-900">
                  {exp.designation} at {exp.organizationName}
                </p>
                <p className="text-sm text-gray-600">
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                  {" | "}
                  {exp.sectorType}
                </p>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {exp.dutiesDescription}
                </p>
              </div>
            ))}
          </div>
        )}
        {cvPath && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-xs text-green-600">CV: Uploaded</p>
          </div>
        )}
      </Card>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentStep === 1 ? "Create Account" : "Complete Your Profile"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {currentStep === 1
              ? "Register to apply for contractual engagements and empanelment at NPC"
              : "Fill in your details once and reuse across all applications"}
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {currentStep > 1 && !(currentStep === 2 && accountCreated) && (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            {currentStep === 1 && (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-700 hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={goNext}
          >
            {currentStep === 5 ? "Complete Registration" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
