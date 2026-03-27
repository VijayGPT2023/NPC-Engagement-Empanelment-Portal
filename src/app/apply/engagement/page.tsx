"use client";

import React, { useCallback, useEffect, useReducer, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import FileUpload from "@/components/ui/FileUpload";
import Card from "@/components/ui/Card";
import {
  TITLES,
  NPC_OFFICES,
  NPC_DOMAINS,
  QUALIFICATION_LEVELS,
  EMPANELMENT_CATEGORIES,
  SERVICE_TYPES,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Post {
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
  termsAndConditions: string;
  applicationDeadline: string;
}

interface Qualification {
  id: string;
  degree: string;
  discipline: string;
  collegeName: string;
  universityInstitution: string;
  yearOfPassing: string;
  marksOrCgpa: string;
  isHighestQualification: boolean;
  certificateFilePath: string;
  certificateFileName: string;
}

interface Experience {
  id: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  organizationName: string;
  designation: string;
  remunerationPayBand: string;
  dutiesDescription: string;
  sectorType: string;
  certificateFilePath: string;
  certificateFileName: string;
}

interface EmpanelmentData {
  optIn: boolean;
  category: string;
  serviceType: string;
  domains: string[];
  areasOfExpertise: string[];
  preferredOffice1: string;
  preferredOffice2: string;
  preferredOffice3: string;
  willingToWorkAnywhere: boolean;
}

interface FormState {
  // Step 1
  selectedPostId: string;
  // Step 2 - Personal
  title: string;
  fullName: string;
  fatherMotherSpouseName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  aadhaarNo: string;
  contactNo: string;
  alternateContactNo: string;
  emailId: string;
  permanentAddress: string;
  correspondenceAddress: string;
  sameAsPermanent: boolean;
  passportPhotoPath: string;
  passportPhotoName: string;
  aadhaarFilePath: string;
  aadhaarFileName: string;
  dobProofPath: string;
  dobProofName: string;
  isRetiredPerson: boolean;
  retirementDate: string;
  lastOrganization: string;
  lastDesignation: string;
  ppoNumber: string;
  ppoFilePath: string;
  ppoFileName: string;
  // Step 3
  qualifications: Qualification[];
  // Step 4
  experiences: Experience[];
  cvFilePath: string;
  cvFileName: string;
  // Step 5
  empanelment: EmpanelmentData;
  // Step 6
  declarationAccepted: boolean;
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "ADD_QUALIFICATION" }
  | { type: "REMOVE_QUALIFICATION"; id: string }
  | { type: "UPDATE_QUALIFICATION"; id: string; field: string; value: unknown }
  | { type: "ADD_EXPERIENCE" }
  | { type: "REMOVE_EXPERIENCE"; id: string }
  | { type: "UPDATE_EXPERIENCE"; id: string; field: string; value: unknown }
  | { type: "SET_EMPANELMENT"; field: string; value: unknown }
  | { type: "TOGGLE_DOMAIN"; code: string }
  | { type: "SET_EXPERTISE"; index: number; value: string }
  | { type: "ADD_EXPERTISE" }
  | { type: "REMOVE_EXPERTISE"; index: number }
  | { type: "LOAD_DRAFT"; state: FormState }
  | { type: "LOAD_PROFILE"; profile: Record<string, unknown> };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createEmptyQualification(): Qualification {
  return {
    id: uid(),
    degree: "",
    discipline: "",
    collegeName: "",
    universityInstitution: "",
    yearOfPassing: "",
    marksOrCgpa: "",
    isHighestQualification: false,
    certificateFilePath: "",
    certificateFileName: "",
  };
}

function createEmptyExperience(): Experience {
  return {
    id: uid(),
    startDate: "",
    endDate: "",
    isCurrent: false,
    organizationName: "",
    designation: "",
    remunerationPayBand: "",
    dutiesDescription: "",
    sectorType: "",
    certificateFilePath: "",
    certificateFileName: "",
  };
}

const INITIAL_STATE: FormState = {
  selectedPostId: "",
  title: "",
  fullName: "",
  fatherMotherSpouseName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Indian",
  aadhaarNo: "",
  contactNo: "",
  alternateContactNo: "",
  emailId: "",
  permanentAddress: "",
  correspondenceAddress: "",
  sameAsPermanent: false,
  passportPhotoPath: "",
  passportPhotoName: "",
  aadhaarFilePath: "",
  aadhaarFileName: "",
  dobProofPath: "",
  dobProofName: "",
  isRetiredPerson: false,
  retirementDate: "",
  lastOrganization: "",
  lastDesignation: "",
  ppoNumber: "",
  ppoFilePath: "",
  ppoFileName: "",
  qualifications: [createEmptyQualification()],
  experiences: [],
  cvFilePath: "",
  cvFileName: "",
  empanelment: {
    optIn: false,
    category: "",
    serviceType: "",
    domains: [],
    areasOfExpertise: [""],
    preferredOffice1: "",
    preferredOffice2: "",
    preferredOffice3: "",
    willingToWorkAnywhere: false,
  },
  declarationAccepted: false,
};

const STEP_LABELS = [
  "Select Post",
  "Personal Details",
  "Qualifications",
  "Experience",
  "Empanelment",
  "Documents & Declaration",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const SECTOR_TYPES = [
  { value: "government", label: "Government" },
  { value: "psu", label: "Public Sector Undertaking" },
  { value: "private", label: "Private" },
  { value: "ngo", label: "NGO / Non-Profit" },
  { value: "academic", label: "Academic / Research" },
  { value: "other", label: "Other" },
];

const STORAGE_KEY = "engagement_application_draft";

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "ADD_QUALIFICATION":
      return {
        ...state,
        qualifications: [...state.qualifications, createEmptyQualification()],
      };

    case "REMOVE_QUALIFICATION":
      return {
        ...state,
        qualifications: state.qualifications.filter((q) => q.id !== action.id),
      };

    case "UPDATE_QUALIFICATION":
      return {
        ...state,
        qualifications: state.qualifications.map((q) =>
          q.id === action.id ? { ...q, [action.field]: action.value } : q
        ),
      };

    case "ADD_EXPERIENCE":
      return {
        ...state,
        experiences: [...state.experiences, createEmptyExperience()],
      };

    case "REMOVE_EXPERIENCE":
      return {
        ...state,
        experiences: state.experiences.filter((e) => e.id !== action.id),
      };

    case "UPDATE_EXPERIENCE":
      return {
        ...state,
        experiences: state.experiences.map((e) =>
          e.id === action.id ? { ...e, [action.field]: action.value } : e
        ),
      };

    case "SET_EMPANELMENT":
      return {
        ...state,
        empanelment: { ...state.empanelment, [action.field]: action.value },
      };

    case "TOGGLE_DOMAIN": {
      const domains = state.empanelment.domains.includes(action.code)
        ? state.empanelment.domains.filter((d) => d !== action.code)
        : [...state.empanelment.domains, action.code];
      return {
        ...state,
        empanelment: { ...state.empanelment, domains },
      };
    }

    case "SET_EXPERTISE": {
      const areas = [...state.empanelment.areasOfExpertise];
      areas[action.index] = action.value;
      return {
        ...state,
        empanelment: { ...state.empanelment, areasOfExpertise: areas },
      };
    }

    case "ADD_EXPERTISE":
      if (state.empanelment.areasOfExpertise.length >= 10) return state;
      return {
        ...state,
        empanelment: {
          ...state.empanelment,
          areasOfExpertise: [...state.empanelment.areasOfExpertise, ""],
        },
      };

    case "REMOVE_EXPERTISE": {
      const areas = state.empanelment.areasOfExpertise.filter(
        (_, i) => i !== action.index
      );
      return {
        ...state,
        empanelment: {
          ...state.empanelment,
          areasOfExpertise: areas.length > 0 ? areas : [""],
        },
      };
    }

    case "LOAD_DRAFT":
      return action.state;

    case "LOAD_PROFILE": {
      const p = action.profile as Record<string, unknown>;
      const quals = Array.isArray(p.qualifications) && p.qualifications.length > 0
        ? (p.qualifications as Record<string, unknown>[]).map((q) => ({
            id: uid(),
            degree: (q.degree as string) || "",
            discipline: (q.discipline as string) || "",
            collegeName: (q.collegeName as string) || "",
            universityInstitution: (q.universityInstitution as string) || "",
            yearOfPassing: (q.yearOfPassing as string) || "",
            marksOrCgpa: (q.marksOrCgpa as string) || "",
            isHighestQualification: (q.isHighestQualification as boolean) || false,
            certificateFilePath: (q.certificateFilePath as string) || "",
            certificateFileName: (q.certificateFileName as string) || "",
          }))
        : [createEmptyQualification()];

      const exps = Array.isArray(p.experiences)
        ? (p.experiences as Record<string, unknown>[]).map((e) => ({
            id: uid(),
            startDate: (e.startDate as string) || "",
            endDate: (e.endDate as string) || "",
            isCurrent: (e.isCurrent as boolean) || false,
            organizationName: (e.organizationName as string) || "",
            designation: (e.designation as string) || "",
            remunerationPayBand: (e.remunerationPayBand as string) || "",
            dutiesDescription: (e.dutiesDescription as string) || "",
            sectorType: (e.sectorType as string) || "",
            certificateFilePath: (e.certificateFilePath as string) || "",
            certificateFileName: (e.certificateFileName as string) || "",
          }))
        : [];

      return {
        ...state,
        title: (p.title as string) || state.title,
        fullName: (p.fullName as string) || state.fullName,
        fatherMotherSpouseName: (p.fatherMotherSpouseName as string) || state.fatherMotherSpouseName,
        dateOfBirth: (p.dateOfBirth as string) || state.dateOfBirth,
        gender: (p.gender as string) || state.gender,
        nationality: (p.nationality as string) || state.nationality,
        aadhaarNo: (p.aadhaarNo as string) || state.aadhaarNo,
        contactNo: (p.contactNo as string) || state.contactNo,
        alternateContactNo: (p.alternateContactNo as string) || state.alternateContactNo,
        emailId: (p.emailId as string) || state.emailId,
        permanentAddress: (p.permanentAddress as string) || state.permanentAddress,
        correspondenceAddress: (p.correspondenceAddress as string) || state.correspondenceAddress,
        passportPhotoPath: (p.passportPhotoPath as string) || state.passportPhotoPath,
        passportPhotoName: (p.passportPhotoName as string) || state.passportPhotoName,
        aadhaarFilePath: (p.aadhaarFilePath as string) || state.aadhaarFilePath,
        aadhaarFileName: (p.aadhaarFileName as string) || state.aadhaarFileName,
        dobProofPath: (p.dobProofPath as string) || state.dobProofPath,
        dobProofName: (p.dobProofName as string) || state.dobProofName,
        qualifications: quals,
        experiences: exps,
        cvFilePath: (p.cvFilePath as string) || state.cvFilePath,
        cvFileName: (p.cvFileName as string) || state.cvFileName,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// File upload helper
// ---------------------------------------------------------------------------

async function uploadFile(file: File): Promise<{ filePath: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { filePath: data.filePath, fileName: file.name };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EngagementApplicationPage() {
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);
  const [step, setStep] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const selectedPost = posts.find((p) => p.id === state.selectedPostId) ?? null;

  // ── Fetch posts ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(Array.isArray(data) ? data : data.posts ?? []);
        }
      } catch {
        /* silently fail */
      } finally {
        setPostsLoading(false);
      }
    })();
  }, []);

  // ── Fetch profile for auto-fill ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          if (profile && (profile.fullName || profile.emailId)) {
            dispatch({ type: "LOAD_PROFILE", profile });
            setProfileExists(true);
          }
        }
      } catch {
        /* silently fail */
      } finally {
        setProfileLoaded(true);
      }
    })();
  }, []);

  // ── Load draft from localStorage ─────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        dispatch({ type: "LOAD_DRAFT", state: { ...INITIAL_STATE, ...parsed } });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Auto-save to localStorage ────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  // ── Field helpers ────────────────────────────────────────────
  const setField = useCallback(
    (field: string, value: unknown) => {
      dispatch({ type: "SET_FIELD", field, value });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const handleInputChange = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setField(field, e.target.value);
      },
    [setField]
  );

  // ── Generic file upload handler ──────────────────────────────
  const handleFileUpload = useCallback(
    async (file: File, pathField: string, nameField: string) => {
      setUploadingField(pathField);
      try {
        const result = await uploadFile(file);
        dispatch({ type: "SET_FIELD", field: pathField, value: result.filePath });
        dispatch({ type: "SET_FIELD", field: nameField, value: result.fileName });
      } catch {
        setErrors((prev) => ({ ...prev, [pathField]: "Upload failed. Please try again." }));
      } finally {
        setUploadingField(null);
      }
    },
    []
  );

  // ── Qualification cert upload ────────────────────────────────
  const handleQualCertUpload = useCallback(
    async (file: File, qualId: string) => {
      setUploadingField(`qual_${qualId}`);
      try {
        const result = await uploadFile(file);
        dispatch({ type: "UPDATE_QUALIFICATION", id: qualId, field: "certificateFilePath", value: result.filePath });
        dispatch({ type: "UPDATE_QUALIFICATION", id: qualId, field: "certificateFileName", value: result.fileName });
      } catch {
        /* ignore */
      } finally {
        setUploadingField(null);
      }
    },
    []
  );

  // ── Experience cert upload ───────────────────────────────────
  const handleExpCertUpload = useCallback(
    async (file: File, expId: string) => {
      setUploadingField(`exp_${expId}`);
      try {
        const result = await uploadFile(file);
        dispatch({ type: "UPDATE_EXPERIENCE", id: expId, field: "certificateFilePath", value: result.filePath });
        dispatch({ type: "UPDATE_EXPERIENCE", id: expId, field: "certificateFileName", value: result.fileName });
      } catch {
        /* ignore */
      } finally {
        setUploadingField(null);
      }
    },
    []
  );

  // ── Validation ───────────────────────────────────────────────
  const validateStep = useCallback(
    (s: number): boolean => {
      const errs: Record<string, string> = {};

      if (s === 0) {
        if (!state.selectedPostId) errs.selectedPostId = "Please select a post.";
      }

      if (s === 1) {
        if (!state.fullName.trim()) errs.fullName = "Full name is required.";
        if (!state.dateOfBirth) errs.dateOfBirth = "Date of birth is required.";
        if (!state.gender) errs.gender = "Gender is required.";
        if (!state.contactNo.trim()) errs.contactNo = "Contact number is required.";
        if (!state.emailId.trim()) errs.emailId = "Email is required.";
        if (!state.permanentAddress.trim()) errs.permanentAddress = "Permanent address is required.";
        if (!state.correspondenceAddress.trim() && !state.sameAsPermanent)
          errs.correspondenceAddress = "Correspondence address is required.";
        if (state.isRetiredPerson) {
          if (!state.retirementDate) errs.retirementDate = "Retirement date is required.";
          if (!state.lastOrganization.trim()) errs.lastOrganization = "Last organization is required.";
          if (!state.lastDesignation.trim()) errs.lastDesignation = "Last designation is required.";
          if (!state.ppoNumber.trim()) errs.ppoNumber = "PPO number is required.";
        }
      }

      if (s === 2) {
        if (state.qualifications.length === 0) {
          errs.qualifications = "At least one qualification is required.";
        } else {
          state.qualifications.forEach((q, i) => {
            if (!q.degree) errs[`qual_${i}_degree`] = "Degree is required.";
            if (!q.collegeName.trim()) errs[`qual_${i}_college`] = "College is required.";
            if (!q.yearOfPassing) errs[`qual_${i}_year`] = "Year is required.";
          });
        }
      }

      if (s === 3) {
        if (!state.cvFilePath) errs.cvFilePath = "CV upload is required.";
      }

      if (s === 4) {
        if (state.empanelment.optIn) {
          if (!state.empanelment.category) errs.emp_category = "Category is required.";
          if (!state.empanelment.serviceType) errs.emp_serviceType = "Service type is required.";
          if (state.empanelment.domains.length === 0) errs.emp_domains = "Select at least one domain.";
          if (!state.empanelment.preferredOffice1) errs.emp_office1 = "Preferred office 1 is required.";
        }
      }

      if (s === 5) {
        if (!state.declarationAccepted) errs.declaration = "You must accept the declaration.";
      }

      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [state]
  );

  const goNext = useCallback(() => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, validateStep]);

  const goPrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    try {
      const body = {
        ...state,
        correspondenceAddress: state.sameAsPermanent
          ? state.permanentAddress
          : state.correspondenceAddress,
      };
      const res = await fetch("/api/applications/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      setApplicationNo(data.applicationNo || data.id || "");
      setSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setErrors({ submit: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [state, validateStep]);

  // ── Success screen ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully</h2>
        {applicationNo && (
          <p className="mt-3 text-lg text-gray-600">
            Application No: <span className="font-semibold text-blue-700">{applicationNo}</span>
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          You can track the status of your application from your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center rounded bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // ── Progress bar ─────────────────────────────────────────────
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${i <= step ? "bg-blue-600" : "bg-gray-300"}`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (i < step) {
                    setStep(i);
                    setErrors({});
                  }
                }}
                className={`
                  flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors
                  ${i < step ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700" : ""}
                  ${i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" : ""}
                  ${i > step ? "bg-gray-200 text-gray-500" : ""}
                `}
              >
                {i < step ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < step ? "bg-blue-600" : "bg-gray-300"}`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs text-center leading-tight ${
                i <= step ? "font-medium text-blue-700" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Inline file display ──────────────────────────────────────
  const renderFileStatus = (
    filePath: string,
    fileName: string,
    pathField: string,
    nameField: string,
    label: string,
    accept: string,
    required: boolean = false,
    documentType: "photo" | "cv" | "aadhaar" | "qualification" | "experience" = "cv"
  ) => (
    <div className="mt-1">
      {filePath ? (
        <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
          <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-700 truncate">
            {fileName || "File uploaded"}
          </span>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SET_FIELD", field: pathField, value: "" });
              dispatch({ type: "SET_FIELD", field: nameField, value: "" });
            }}
            className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Re-upload
          </button>
        </div>
      ) : (
        <FileUpload
          documentType={documentType}
          label={label}
          accept={accept}
          required={required}
          onUpload={(file) => handleFileUpload(file, pathField, nameField)}
        />
      )}
      {uploadingField === pathField && (
        <p className="mt-1 text-xs text-blue-600">Uploading...</p>
      )}
      {errors[pathField] && (
        <p className="mt-1 text-xs text-red-600">{errors[pathField]}</p>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // STEP 1: Select Post
  // ══════════════════════════════════════════════════════════════
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Select Post</h2>
      <p className="text-sm text-gray-500 mb-6">
        Choose the post you wish to apply for from the active openings below.
      </p>

      {postsLoading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-500">Loading active posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-6 text-center">
          <p className="text-gray-700">No active posts available at this time.</p>
          <Link href="/dashboard" className="mt-2 inline-block text-sm text-blue-700 underline">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setField("selectedPostId", post.id)}
              className={`
                w-full rounded-lg border-2 p-5 text-left transition-all duration-150
                ${state.selectedPostId === post.id
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
                }
              `}
            >
              <h3 className="font-semibold text-gray-900">{post.title}</h3>
              <p className="mt-1 text-xs text-gray-500">Adv. No: {post.advertisementNo}</p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>Domain: <span className="font-medium">{post.domain}</span></span>
                <span>Role: <span className="font-medium">{post.functionalRole}</span></span>
                <span>Location: <span className="font-medium">{post.placeOfDeployment}</span></span>
                <span>Positions: <span className="font-medium">{post.numberOfPositions}</span></span>
                {post.remunerationRange && (
                  <span className="col-span-2">
                    Remuneration: <span className="font-medium">{post.remunerationRange}</span>
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-red-600">
                Deadline: {new Date(post.applicationDeadline).toLocaleDateString("en-IN")}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Post details panel */}
      {selectedPost && (
        <Card className="mt-6" title="Post Details">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Eligibility Criteria</h4>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{selectedPost.eligibilityCriteria}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Work Responsibilities</h4>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{selectedPost.workResponsibilities}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Terms & Conditions</h4>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{selectedPost.termsAndConditions}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Min. Qualification:</span>{" "}
                <span className="font-medium">{selectedPost.minQualification}</span>
              </div>
              <div>
                <span className="text-gray-500">Min. Experience:</span>{" "}
                <span className="font-medium">{selectedPost.minExperienceYears} years</span>
              </div>
              {selectedPost.maxAgeLimitYears && (
                <div>
                  <span className="text-gray-500">Max Age:</span>{" "}
                  <span className="font-medium">{selectedPost.maxAgeLimitYears} years</span>
                </div>
              )}
              {selectedPost.contractPeriod && (
                <div>
                  <span className="text-gray-500">Contract Period:</span>{" "}
                  <span className="font-medium">{selectedPost.contractPeriod}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {errors.selectedPostId && (
        <p className="mt-3 text-sm text-red-600">{errors.selectedPostId}</p>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // STEP 2: Personal Details
  // ══════════════════════════════════════════════════════════════
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Provide your personal information. Fields marked with * are required.
      </p>

      {/* Auto-fill banner */}
      {profileLoaded && profileExists && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Auto-filled from your profile.</span> You may edit any field if needed.
          </p>
        </div>
      )}
      {profileLoaded && !profileExists && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
          <p className="text-sm text-yellow-800">
            Complete your profile first for auto-fill.{" "}
            <Link href="/dashboard/profile" className="font-semibold underline">
              Go to Profile
            </Link>
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Name row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            name="title"
            label="Title"
            value={state.title}
            onChange={handleInputChange("title")}
            options={TITLES.map((t) => ({ value: t, label: t }))}
            placeholder="Select"
          />
          <Input
            name="fullName"
            label="Full Name"
            required
            value={state.fullName}
            onChange={handleInputChange("fullName")}
            error={errors.fullName}
            className="sm:col-span-2"
          />
        </div>

        <Input
          name="fatherMotherSpouseName"
          label="Father's / Mother's / Husband's Name"
          value={state.fatherMotherSpouseName}
          onChange={handleInputChange("fatherMotherSpouseName")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            required
            value={state.dateOfBirth}
            onChange={handleInputChange("dateOfBirth")}
            error={errors.dateOfBirth}
          />
          <Select
            name="gender"
            label="Gender"
            required
            value={state.gender}
            onChange={handleInputChange("gender")}
            options={GENDER_OPTIONS}
            placeholder="Select"
            error={errors.gender}
          />
          <Input
            name="nationality"
            label="Nationality"
            value={state.nationality}
            onChange={handleInputChange("nationality")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            name="aadhaarNo"
            label="Aadhaar No."
            value={state.aadhaarNo}
            onChange={handleInputChange("aadhaarNo")}
            placeholder="XXXX XXXX XXXX"
          />
          <Input
            name="contactNo"
            label="Contact No."
            required
            value={state.contactNo}
            onChange={handleInputChange("contactNo")}
            error={errors.contactNo}
          />
          <Input
            name="alternateContactNo"
            label="Alternate Contact No."
            value={state.alternateContactNo}
            onChange={handleInputChange("alternateContactNo")}
          />
        </div>

        <Input
          name="emailId"
          label="Email"
          type="email"
          required
          value={state.emailId}
          onChange={handleInputChange("emailId")}
          error={errors.emailId}
        />

        <TextArea
          name="permanentAddress"
          label="Permanent Address"
          required
          rows={3}
          value={state.permanentAddress}
          onChange={handleInputChange("permanentAddress") as unknown as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
          error={errors.permanentAddress}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={state.sameAsPermanent}
            onChange={(e) => {
              setField("sameAsPermanent", e.target.checked);
              if (e.target.checked) setField("correspondenceAddress", state.permanentAddress);
            }}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          Correspondence address same as permanent address
        </label>

        {!state.sameAsPermanent && (
          <TextArea
            name="correspondenceAddress"
            label="Correspondence Address"
            required
            rows={3}
            value={state.correspondenceAddress}
            onChange={handleInputChange("correspondenceAddress") as unknown as (e: React.ChangeEvent<HTMLTextAreaElement>) => void}
            error={errors.correspondenceAddress}
          />
        )}

        {/* Document uploads inline */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-5">
          <h3 className="text-sm font-semibold text-gray-800">Identity & Photo Documents</h3>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Passport Photo{" "}
              {state.passportPhotoPath && (
                <span className="text-xs font-normal text-green-700">(From Profile: {state.passportPhotoName})</span>
              )}
            </p>
            {renderFileStatus(
              state.passportPhotoPath,
              state.passportPhotoName,
              "passportPhotoPath",
              "passportPhotoName",
              "Upload Passport Photo",
              "image/*",
              false,
              "photo"
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Aadhaar Card{" "}
              {state.aadhaarFilePath && (
                <span className="text-xs font-normal text-green-700">(From Profile: {state.aadhaarFileName})</span>
              )}
            </p>
            {renderFileStatus(
              state.aadhaarFilePath,
              state.aadhaarFileName,
              "aadhaarFilePath",
              "aadhaarFileName",
              "Upload Aadhaar Card",
              ".pdf,.jpg,.jpeg,.png",
              false,
              "aadhaar"
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              DOB Proof{" "}
              {state.dobProofPath && (
                <span className="text-xs font-normal text-green-700">(From Profile: {state.dobProofName})</span>
              )}
            </p>
            {renderFileStatus(
              state.dobProofPath,
              state.dobProofName,
              "dobProofPath",
              "dobProofName",
              "Upload DOB Proof",
              ".pdf,.jpg,.jpeg,.png",
              false,
              "cv"
            )}
          </div>
        </div>

        {/* Retired person section */}
        <div className="rounded-lg border border-gray-200 p-5 space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <div
              role="switch"
              aria-checked={state.isRetiredPerson}
              tabIndex={0}
              onClick={() => setField("isRetiredPerson", !state.isRetiredPerson)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setField("isRetiredPerson", !state.isRetiredPerson);
              }}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200
                ${state.isRetiredPerson ? "bg-blue-600" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5
                  ${state.isRetiredPerson ? "translate-x-5 ml-0.5" : "translate-x-0.5"}
                `}
              />
            </div>
            Are you a retired person?
          </label>

          {state.isRetiredPerson && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <Input
                name="retirementDate"
                label="Retirement Date"
                type="date"
                required
                value={state.retirementDate}
                onChange={handleInputChange("retirementDate")}
                error={errors.retirementDate}
              />
              <Input
                name="lastOrganization"
                label="Last Organization"
                required
                value={state.lastOrganization}
                onChange={handleInputChange("lastOrganization")}
                error={errors.lastOrganization}
              />
              <Input
                name="lastDesignation"
                label="Last Designation"
                required
                value={state.lastDesignation}
                onChange={handleInputChange("lastDesignation")}
                error={errors.lastDesignation}
              />
              <Input
                name="ppoNumber"
                label="PPO Number"
                required
                value={state.ppoNumber}
                onChange={handleInputChange("ppoNumber")}
                error={errors.ppoNumber}
              />
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-1">PPO Document</p>
                {renderFileStatus(
                  state.ppoFilePath,
                  state.ppoFileName,
                  "ppoFilePath",
                  "ppoFileName",
                  "Upload PPO",
                  ".pdf,.jpg,.jpeg,.png",
                  false,
                  "cv"
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // STEP 3: Educational Qualifications
  // ══════════════════════════════════════════════════════════════
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Educational Qualifications</h2>
      <p className="text-sm text-gray-500 mb-2">
        Add all your educational qualifications. Certificate uploads are mandatory for screening.
      </p>
      <div className="mb-6 rounded border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-xs text-blue-800">
          Key details (college, year, marks) are used for auto-screening. Ensure they match your certificates.
        </p>
      </div>

      {errors.qualifications && (
        <p className="mb-4 text-sm text-red-600">{errors.qualifications}</p>
      )}

      <div className="space-y-6">
        {state.qualifications.map((q, idx) => (
          <Card key={q.id} className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Qualification {idx + 1}</h3>
              {state.qualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_QUALIFICATION", id: q.id })}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                name={`qual_${idx}_degree`}
                label="Degree"
                required
                value={q.degree}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "degree", value: e.target.value })
                }
                options={QUALIFICATION_LEVELS.map((l) => ({ value: l, label: l }))}
                placeholder="Select degree"
                error={errors[`qual_${idx}_degree`]}
              />
              <Input
                name={`qual_${idx}_discipline`}
                label="Discipline / Subject"
                value={q.discipline}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "discipline", value: e.target.value })
                }
              />
              <Input
                name={`qual_${idx}_college`}
                label="College / Institute"
                required
                value={q.collegeName}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "collegeName", value: e.target.value })
                }
                error={errors[`qual_${idx}_college`]}
              />
              <Input
                name={`qual_${idx}_university`}
                label="University / Board"
                value={q.universityInstitution}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "universityInstitution", value: e.target.value })
                }
              />
              <Input
                name={`qual_${idx}_year`}
                label="Year of Passing"
                type="number"
                required
                value={q.yearOfPassing}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "yearOfPassing", value: e.target.value })
                }
                error={errors[`qual_${idx}_year`]}
              />
              <Input
                name={`qual_${idx}_marks`}
                label="Marks % / CGPA"
                value={q.marksOrCgpa}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "marksOrCgpa", value: e.target.value })
                }
              />
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={q.isHighestQualification}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "isHighestQualification", value: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              This is my highest qualification
            </label>

            {/* Inline certificate upload */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Certificate{" "}
                {q.certificateFilePath && (
                  <span className="text-xs font-normal text-green-700">(From Profile: {q.certificateFileName})</span>
                )}
              </p>
              {q.certificateFilePath ? (
                <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                  <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate">{q.certificateFileName || "File uploaded"}</span>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "certificateFilePath", value: "" });
                      dispatch({ type: "UPDATE_QUALIFICATION", id: q.id, field: "certificateFileName", value: "" });
                    }}
                    className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Re-upload
                  </button>
                </div>
              ) : (
                <FileUpload
                  documentType="qualification"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUpload={(file) => handleQualCertUpload(file, q.id)}
                />
              )}
              {uploadingField === `qual_${q.id}` && (
                <p className="mt-1 text-xs text-blue-600">Uploading...</p>
              )}
            </div>
          </Card>
        ))}

        <Button variant="outline" onClick={() => dispatch({ type: "ADD_QUALIFICATION" })}>
          + Add Qualification
        </Button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // STEP 4: Work Experience
  // ══════════════════════════════════════════════════════════════
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Work Experience</h2>
      <p className="text-sm text-gray-500 mb-6">
        Add your professional experience. You may upload supporting certificates inline.
      </p>

      {state.experiences.length === 0 ? (
        <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500 mb-3">No experience entries added yet.</p>
          <Button variant="outline" onClick={() => dispatch({ type: "ADD_EXPERIENCE" })}>
            + Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {state.experiences.map((exp, idx) => (
            <Card key={exp.id} className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Experience {idx + 1}</h3>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_EXPERIENCE", id: exp.id })}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name={`exp_${idx}_org`}
                  label="Organization"
                  value={exp.organizationName}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "organizationName", value: e.target.value })
                  }
                />
                <Input
                  name={`exp_${idx}_desg`}
                  label="Designation"
                  value={exp.designation}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "designation", value: e.target.value })
                  }
                />
                <Input
                  name={`exp_${idx}_start`}
                  label="Start Date"
                  type="date"
                  value={exp.startDate}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "startDate", value: e.target.value })
                  }
                />
                <div>
                  {!exp.isCurrent && (
                    <Input
                      name={`exp_${idx}_end`}
                      label="End Date"
                      type="date"
                      value={exp.endDate}
                      onChange={(e) =>
                        dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "endDate", value: e.target.value })
                      }
                    />
                  )}
                  <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={exp.isCurrent}
                      onChange={(e) => {
                        dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "isCurrent", value: e.target.checked });
                        if (e.target.checked) dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "endDate", value: "" });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    Currently Working
                  </label>
                </div>
                <Input
                  name={`exp_${idx}_pay`}
                  label="Remuneration / Pay Band"
                  value={exp.remunerationPayBand}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "remunerationPayBand", value: e.target.value })
                  }
                />
                <Select
                  name={`exp_${idx}_sector`}
                  label="Sector Type"
                  value={exp.sectorType}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "sectorType", value: e.target.value })
                  }
                  options={SECTOR_TYPES}
                  placeholder="Select sector"
                />
              </div>

              <div className="mt-4">
                <TextArea
                  name={`exp_${idx}_duties`}
                  label="Duties & Responsibilities"
                  rows={3}
                  maxLength={400}
                  value={exp.dutiesDescription}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "dutiesDescription", value: e.target.value })
                  }
                />
              </div>

              {/* Inline experience certificate upload */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Experience Certificate{" "}
                  {exp.certificateFilePath && (
                    <span className="text-xs font-normal text-green-700">(From Profile: {exp.certificateFileName})</span>
                  )}
                </p>
                {exp.certificateFilePath ? (
                  <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                    <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 truncate">{exp.certificateFileName || "File uploaded"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "certificateFilePath", value: "" });
                        dispatch({ type: "UPDATE_EXPERIENCE", id: exp.id, field: "certificateFileName", value: "" });
                      }}
                      className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Re-upload
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    documentType="experience"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onUpload={(file) => handleExpCertUpload(file, exp.id)}
                  />
                )}
                {uploadingField === `exp_${exp.id}` && (
                  <p className="mt-1 text-xs text-blue-600">Uploading...</p>
                )}
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={() => dispatch({ type: "ADD_EXPERIENCE" })}>
            + Add Experience
          </Button>
        </div>
      )}

      {/* CV Upload */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Upload Updated Duly Signed CV *</h3>
        <p className="text-xs text-gray-500 mb-3">PDF or DOC format required.</p>
        {renderFileStatus(
          state.cvFilePath,
          state.cvFileName,
          "cvFilePath",
          "cvFileName",
          "Upload CV",
          ".pdf,.doc,.docx",
          true,
          "cv"
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // STEP 5: Empanelment Opt-in
  // ══════════════════════════════════════════════════════════════
  const renderStep5 = () => {
    const selectedCategory = EMPANELMENT_CATEGORIES.find(
      (c) => c.code === state.empanelment.category
    );

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Empanelment Opt-in</h2>
        <p className="text-sm text-gray-500 mb-6">
          Optionally apply for empanelment as an external expert alongside your engagement application.
        </p>

        {/* Prominent toggle */}
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-5 mb-6">
          <label className="flex items-center gap-4">
            <div
              role="switch"
              aria-checked={state.empanelment.optIn}
              tabIndex={0}
              onClick={() => dispatch({ type: "SET_EMPANELMENT", field: "optIn", value: !state.empanelment.optIn })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  dispatch({ type: "SET_EMPANELMENT", field: "optIn", value: !state.empanelment.optIn });
              }}
              className={`
                relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200
                ${state.empanelment.optIn ? "bg-blue-600" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5
                  ${state.empanelment.optIn ? "translate-x-5 ml-0.5" : "translate-x-0.5"}
                `}
              />
            </div>
            <span className="text-base font-semibold text-gray-900">
              Do you also want to apply for Empanelment as External Expert?
            </span>
          </label>

          <div className="mt-3 rounded border border-blue-300 bg-white px-4 py-3">
            <p className="text-sm text-blue-900">
              By selecting <strong>Yes</strong>, your application will be submitted for both:
            </p>
            <ol className="mt-2 ml-5 list-decimal text-sm text-blue-800 space-y-1">
              <li>Engagement against the selected post</li>
              <li>Empanelment as an external expert/associate with NPC</li>
            </ol>
          </div>
        </div>

        {state.empanelment.optIn && (
          <div className="space-y-6">
            {/* Category */}
            <Select
              name="emp_category"
              label="Category Applied For"
              required
              value={state.empanelment.category}
              onChange={(e) => dispatch({ type: "SET_EMPANELMENT", field: "category", value: e.target.value })}
              options={EMPANELMENT_CATEGORIES.map((c) => ({ value: c.code, label: c.name }))}
              placeholder="Select category"
              error={errors.emp_category}
            />
            {selectedCategory && (
              <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Eligibility Criteria</p>
                <p className="text-sm text-gray-700">{selectedCategory.eligibility}</p>
              </div>
            )}

            {/* Service Type */}
            <Select
              name="emp_serviceType"
              label="Service Type"
              required
              value={state.empanelment.serviceType}
              onChange={(e) => dispatch({ type: "SET_EMPANELMENT", field: "serviceType", value: e.target.value })}
              options={SERVICE_TYPES.map((s) => ({ value: s.code, label: s.name }))}
              placeholder="Select service type"
              error={errors.emp_serviceType}
            />

            {/* Domains */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Domain(s) of Expertise <span className="text-red-600">*</span>
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {NPC_DOMAINS.map((d) => (
                  <label
                    key={d.code}
                    className={`
                      flex items-center gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors
                      ${state.empanelment.domains.includes(d.code)
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={state.empanelment.domains.includes(d.code)}
                      onChange={() => dispatch({ type: "TOGGLE_DOMAIN", code: d.code })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    {d.name}
                  </label>
                ))}
              </div>
              {errors.emp_domains && (
                <p className="mt-1 text-xs text-red-600">{errors.emp_domains}</p>
              )}
            </div>

            {/* Areas of Expertise */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Areas of Expertise (up to 10)
              </p>
              <div className="space-y-2">
                {state.empanelment.areasOfExpertise.map((area, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      name={`expertise_${i}`}
                      value={area}
                      onChange={(e) => dispatch({ type: "SET_EXPERTISE", index: i, value: e.target.value })}
                      placeholder={`Area ${i + 1}`}
                      className="flex-1"
                    />
                    {state.empanelment.areasOfExpertise.length > 1 && (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "REMOVE_EXPERTISE", index: i })}
                        className="flex-shrink-0 rounded p-2 text-red-500 hover:bg-red-50"
                        aria-label="Remove area"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {state.empanelment.areasOfExpertise.length < 10 && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "ADD_EXPERTISE" })}
                  className="mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  + Add Area
                </button>
              )}
            </div>

            {/* Preferred Offices */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                name="emp_office1"
                label="Preferred NPC Office 1 *"
                required
                value={state.empanelment.preferredOffice1}
                onChange={(e) => dispatch({ type: "SET_EMPANELMENT", field: "preferredOffice1", value: e.target.value })}
                options={NPC_OFFICES.map((o) => ({ value: o.code, label: o.name }))}
                placeholder="Select office"
                error={errors.emp_office1}
              />
              <Select
                name="emp_office2"
                label="Preferred NPC Office 2"
                value={state.empanelment.preferredOffice2}
                onChange={(e) => dispatch({ type: "SET_EMPANELMENT", field: "preferredOffice2", value: e.target.value })}
                options={[
                  { value: "", label: "-- None --" },
                  ...NPC_OFFICES.map((o) => ({ value: o.code, label: o.name })),
                ]}
              />
              <Select
                name="emp_office3"
                label="Preferred NPC Office 3"
                value={state.empanelment.preferredOffice3}
                onChange={(e) => dispatch({ type: "SET_EMPANELMENT", field: "preferredOffice3", value: e.target.value })}
                options={[
                  { value: "", label: "-- None --" },
                  ...NPC_OFFICES.map((o) => ({ value: o.code, label: o.name })),
                ]}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={state.empanelment.willingToWorkAnywhere}
                onChange={(e) =>
                  dispatch({ type: "SET_EMPANELMENT", field: "willingToWorkAnywhere", value: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              Willing to work anywhere in India
            </label>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // STEP 6: Declaration & Submit
  // ══════════════════════════════════════════════════════════════
  const renderStep6 = () => {
    const totalYears = state.experiences.reduce((sum, e) => {
      const start = e.startDate ? new Date(e.startDate) : null;
      const end = e.isCurrent ? new Date() : e.endDate ? new Date(e.endDate) : null;
      if (start && end) {
        return sum + Math.max(0, (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      return sum;
    }, 0);

    const docsList = [
      { label: "Passport Photo", attached: !!state.passportPhotoPath },
      { label: "Aadhaar Card", attached: !!state.aadhaarFilePath },
      { label: "DOB Proof", attached: !!state.dobProofPath },
      { label: "CV", attached: !!state.cvFilePath },
      ...state.qualifications.map((q, i) => ({
        label: `Qualification ${i + 1} Certificate`,
        attached: !!q.certificateFilePath,
      })),
      ...state.experiences.map((e, i) => ({
        label: `Experience ${i + 1} Certificate`,
        attached: !!e.certificateFilePath,
      })),
      ...(state.isRetiredPerson
        ? [{ label: "PPO Document", attached: !!state.ppoFilePath }]
        : []),
    ];

    const highestQual = state.qualifications.find((q) => q.isHighestQualification);

    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Documents & Declaration</h2>
        <p className="text-sm text-gray-500 mb-6">Review your documents and accept the declaration to submit.</p>

        <div className="space-y-6">
          {/* Documents — on top */}
          <Card title="Documents Attached">
            <div className="space-y-1">
              {docsList.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {doc.attached ? (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={doc.attached ? "text-gray-700" : "text-gray-400"}>{doc.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Application Summary */}
          <Card title="Application Summary">
            <div className="space-y-4">
              {selectedPost && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Post Applied For</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-gray-500">Title:</span> <span className="font-medium">{selectedPost.title}</span></div>
                    <div><span className="text-gray-500">Adv. No:</span> <span className="font-medium">{selectedPost.advertisementNo}</span></div>
                    <div><span className="text-gray-500">Domain:</span> <span className="font-medium">{selectedPost.domain}</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="font-medium">{selectedPost.placeOfDeployment}</span></div>
                  </div>
                </div>
              )}
              <hr className="border-gray-100" />
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Personal Details</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{state.title} {state.fullName}</span></div>
                  <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{state.dateOfBirth}</span></div>
                  <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{state.gender}</span></div>
                  <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{state.contactNo}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{state.emailId}</span></div>
                  {state.aadhaarNo && (
                    <div><span className="text-gray-500">Aadhaar:</span> <span className="font-medium">{state.aadhaarNo}</span></div>
                  )}
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="grid grid-cols-2 gap-x-6 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Qualifications</h4>
                  <p><span className="text-gray-500">Total:</span> <span className="font-medium">{state.qualifications.length}</span></p>
                  {highestQual && (
                    <p><span className="text-gray-500">Highest:</span> <span className="font-medium">{highestQual.degree} - {highestQual.discipline}</span></p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Experience</h4>
                  <p><span className="text-gray-500">Entries:</span> <span className="font-medium">{state.experiences.length}</span></p>
                  <p><span className="text-gray-500">Total Years:</span> <span className="font-medium">{totalYears.toFixed(1)}</span></p>
                </div>
              </div>
            </div>
          </Card>

          {/* Empanelment */}
          {state.empanelment.optIn && (
            <Card title="Empanelment Opt-in">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>{" "}
                  <span className="font-medium">
                    {EMPANELMENT_CATEGORIES.find((c) => c.code === state.empanelment.category)?.name || state.empanelment.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Service Type:</span>{" "}
                  <span className="font-medium">
                    {SERVICE_TYPES.find((s) => s.code === state.empanelment.serviceType)?.name || state.empanelment.serviceType}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Domains:</span>{" "}
                  <span className="font-medium">
                    {state.empanelment.domains
                      .map((code) => NPC_DOMAINS.find((d) => d.code === code)?.name || code)
                      .join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Preferred Office:</span>{" "}
                  <span className="font-medium">
                    {NPC_OFFICES.find((o) => o.code === state.empanelment.preferredOffice1)?.name || state.empanelment.preferredOffice1}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Declaration */}
          <div className="rounded-lg border-2 border-gray-300 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Declaration</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The information furnished above is true to the best of my knowledge and belief. I have
              carefully read the terms and conditions mentioned in the advertisement done by NPC and
              they are acceptable by me. I certify that no disciplinary proceedings are pending against
              me, as on date. I also state that I have disclosed all material facts.
            </p>

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={state.declarationAccepted}
                  onChange={(e) => setField("declarationAccepted", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                I accept the above declaration
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Date: {new Date().toLocaleDateString("en-IN")}
            </p>
            {errors.declaration && (
              <p className="mt-2 text-xs text-red-600">{errors.declaration}</p>
            )}
          </div>

          {errors.submit && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // Main Render
  // ══════════════════════════════════════════════════════════════
  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Engagement Application</h1>
      <p className="text-sm text-gray-500 mb-8">
        Apply for contractual engagement with the National Productivity Council.
      </p>

      {renderProgressBar()}

      <div className="min-h-[400px]">{stepRenderers[step]()}</div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          {step > 0 && (
            <Button variant="outline" onClick={goPrev}>
              Previous
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 5 && (
            <Button onClick={goNext}>
              Next
            </Button>
          )}
          {step === 5 && (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              size="lg"
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
