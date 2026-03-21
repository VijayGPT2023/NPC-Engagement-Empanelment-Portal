"use client";

import React, { useReducer, useEffect, useCallback, useRef } from "react";
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
  EMPANELMENT_CATEGORIES,
  SERVICE_TYPES,
  QUALIFICATION_LEVELS,
} from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface PersonalDetails {
  title: string;
  fullName: string;
  parentSpouseName: string;
  dob: string;
  gender: string;
  nationality: string;
  aadhaar: string;
  contactNo: string;
  altContactNo: string;
  email: string;
  address: string;
  photoFile: UploadedFile | null;
  aadhaarFile: UploadedFile | null;
}

interface CategoryDomain {
  category: string;
  serviceType: string;
  domains: string[];
  areasOfExpertise: string[];
}

interface PreferredOffices {
  willingAnywhere: boolean;
  office1: string;
  office2: string;
  office3: string;
}

interface Qualification {
  id: string;
  degree: string;
  discipline: string;
  college: string;
  university: string;
  year: string;
  marks: string;
  isHighest: boolean;
  certificateFile: UploadedFile | null;
}

interface Experience {
  id: string;
  employer: string;
  designation: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  sectorType: string;
  certificateFile: UploadedFile | null;
}

interface ConsultancyProject {
  id: string;
  title: string;
  clientOrg: string;
  clientType: string;
  startDate: string;
  endDate: string;
  description: string;
  supportingDoc: UploadedFile | null;
}

interface TrainingProgram {
  id: string;
  title: string;
  clientOrg: string;
  clientType: string;
  trainingMode: string;
  startDate: string;
  endDate: string;
  participants: string;
  supportingDoc: UploadedFile | null;
}

interface Certification {
  id: string;
  name: string;
  issuingOrg: string;
  dateObtained: string;
  validTill: string;
  certificateFile: UploadedFile | null;
}

interface Membership {
  id: string;
  institution: string;
  membershipType: string;
  fromDate: string;
  toDate: string;
}

interface FormData {
  personal: PersonalDetails;
  categoryDomain: CategoryDomain;
  offices: PreferredOffices;
  qualifications: Qualification[];
  experiences: Experience[];
  cvFile: UploadedFile | null;
  consultancyProjects: ConsultancyProject[];
  researchProjects: ConsultancyProject[];
  trainingPrograms: TrainingProgram[];
  certifications: Certification[];
  memberships: Membership[];
  declarationAccepted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEPS = [
  "Personal Details",
  "Category & Domain",
  "Preferred Offices",
  "Educational Qualifications",
  "Work Experience & CV",
  "Service Experience",
  "Declaration & Submit",
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const CLIENT_TYPE_OPTIONS = [
  { value: "govt_public", label: "Government / Public Sector" },
  { value: "private", label: "Private Sector" },
];

const TRAINING_MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "physical", label: "Physical" },
];

const SECTOR_TYPE_OPTIONS = [
  { value: "government", label: "Government" },
  { value: "public_sector", label: "Public Sector" },
  { value: "private", label: "Private Sector" },
  { value: "ngo", label: "NGO / Non-Profit" },
  { value: "academic", label: "Academic / Research" },
  { value: "international", label: "International Organization" },
  { value: "other", label: "Other" },
];

const STORAGE_KEY = "npc_empanelment_draft";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyPersonal(): PersonalDetails {
  return {
    title: "",
    fullName: "",
    parentSpouseName: "",
    dob: "",
    gender: "",
    nationality: "Indian",
    aadhaar: "",
    contactNo: "",
    altContactNo: "",
    email: "",
    address: "",
    photoFile: null,
    aadhaarFile: null,
  };
}

function emptyQualification(): Qualification {
  return {
    id: uid(),
    degree: "",
    discipline: "",
    college: "",
    university: "",
    year: "",
    marks: "",
    isHighest: false,
    certificateFile: null,
  };
}

function emptyExperience(): Experience {
  return {
    id: uid(),
    employer: "",
    designation: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    sectorType: "",
    certificateFile: null,
  };
}

function emptyConsultancy(): ConsultancyProject {
  return {
    id: uid(),
    title: "",
    clientOrg: "",
    clientType: "",
    startDate: "",
    endDate: "",
    description: "",
    supportingDoc: null,
  };
}

function emptyTraining(): TrainingProgram {
  return {
    id: uid(),
    title: "",
    clientOrg: "",
    clientType: "",
    trainingMode: "",
    startDate: "",
    endDate: "",
    participants: "",
    supportingDoc: null,
  };
}

function emptyCertification(): Certification {
  return {
    id: uid(),
    name: "",
    issuingOrg: "",
    dateObtained: "",
    validTill: "",
    certificateFile: null,
  };
}

function emptyMembership(): Membership {
  return { id: uid(), institution: "", membershipType: "", fromDate: "", toDate: "" };
}

function initialFormData(): FormData {
  return {
    personal: emptyPersonal(),
    categoryDomain: { category: "", serviceType: "", domains: [], areasOfExpertise: [""] },
    offices: { willingAnywhere: true, office1: "", office2: "", office3: "" },
    qualifications: [emptyQualification()],
    experiences: [emptyExperience()],
    cvFile: null,
    consultancyProjects: [],
    researchProjects: [],
    trainingPrograms: [],
    certifications: [],
    memberships: [],
    declarationAccepted: false,
  };
}

/* ------------------------------------------------------------------ */
/*  Reducer                                                            */
/* ------------------------------------------------------------------ */

type Action =
  | { type: "SET_FORM"; payload: FormData }
  | { type: "SET_PERSONAL"; payload: Partial<PersonalDetails> }
  | { type: "SET_CATEGORY_DOMAIN"; payload: Partial<CategoryDomain> }
  | { type: "SET_OFFICES"; payload: Partial<PreferredOffices> }
  | { type: "SET_QUALIFICATIONS"; payload: Qualification[] }
  | { type: "SET_EXPERIENCES"; payload: Experience[] }
  | { type: "SET_CV_FILE"; payload: UploadedFile | null }
  | { type: "SET_CONSULTANCY"; payload: ConsultancyProject[] }
  | { type: "SET_RESEARCH"; payload: ConsultancyProject[] }
  | { type: "SET_TRAINING"; payload: TrainingProgram[] }
  | { type: "SET_CERTIFICATIONS"; payload: Certification[] }
  | { type: "SET_MEMBERSHIPS"; payload: Membership[] }
  | { type: "SET_DECLARATION"; payload: boolean };

function formReducer(state: FormData, action: Action): FormData {
  switch (action.type) {
    case "SET_FORM":
      return action.payload;
    case "SET_PERSONAL":
      return { ...state, personal: { ...state.personal, ...action.payload } };
    case "SET_CATEGORY_DOMAIN":
      return { ...state, categoryDomain: { ...state.categoryDomain, ...action.payload } };
    case "SET_OFFICES":
      return { ...state, offices: { ...state.offices, ...action.payload } };
    case "SET_QUALIFICATIONS":
      return { ...state, qualifications: action.payload };
    case "SET_EXPERIENCES":
      return { ...state, experiences: action.payload };
    case "SET_CV_FILE":
      return { ...state, cvFile: action.payload };
    case "SET_CONSULTANCY":
      return { ...state, consultancyProjects: action.payload };
    case "SET_RESEARCH":
      return { ...state, researchProjects: action.payload };
    case "SET_TRAINING":
      return { ...state, trainingPrograms: action.payload };
    case "SET_CERTIFICATIONS":
      return { ...state, certifications: action.payload };
    case "SET_MEMBERSHIPS":
      return { ...state, memberships: action.payload };
    case "SET_DECLARATION":
      return { ...state, declarationAccepted: action.payload };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

type Errors = Record<string, string>;

function validateStep(step: number, data: FormData): Errors {
  const e: Errors = {};

  if (step === 0) {
    const p = data.personal;
    if (!p.title) e["personal.title"] = "Title is required";
    if (!p.fullName.trim()) e["personal.fullName"] = "Full name is required";
    if (!p.dob) e["personal.dob"] = "Date of birth is required";
    if (!p.gender) e["personal.gender"] = "Gender is required";
    if (!p.nationality.trim()) e["personal.nationality"] = "Nationality is required";
    if (!p.contactNo.trim()) e["personal.contactNo"] = "Contact number is required";
    else if (!/^\d{10}$/.test(p.contactNo.trim()))
      e["personal.contactNo"] = "Enter a valid 10-digit number";
    if (p.altContactNo.trim() && !/^\d{10}$/.test(p.altContactNo.trim()))
      e["personal.altContactNo"] = "Enter a valid 10-digit number";
    if (!p.email.trim()) e["personal.email"] = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()))
      e["personal.email"] = "Enter a valid email address";
    if (!p.address.trim()) e["personal.address"] = "Address is required";
    if (p.aadhaar.trim() && !/^\d{12}$/.test(p.aadhaar.replace(/\s/g, "")))
      e["personal.aadhaar"] = "Enter a valid 12-digit Aadhaar number";
  }

  if (step === 1) {
    const c = data.categoryDomain;
    if (!c.category) e["category"] = "Please select a category";
    if (!c.serviceType) e["serviceType"] = "Please select a service type";
    if (c.domains.length === 0) e["domains"] = "Select at least one domain";
  }

  if (step === 2) {
    const o = data.offices;
    if (!o.willingAnywhere && !o.office1) e["office1"] = "At least one preferred office is required";
  }

  if (step === 3) {
    if (data.qualifications.length === 0) {
      e["qualifications"] = "At least one qualification is required";
    } else {
      data.qualifications.forEach((q, i) => {
        if (!q.degree) e[`qual.${i}.degree`] = "Degree is required";
        if (!q.college) e[`qual.${i}.college`] = "College is required";
        if (!q.university) e[`qual.${i}.university`] = "University is required";
        if (!q.year) e[`qual.${i}.year`] = "Year is required";
      });
    }
  }

  if (step === 4) {
    if (!data.cvFile) e["cvFile"] = "Updated signed CV is required";
  }

  if (step === 6) {
    if (!data.declarationAccepted)
      e["declaration"] = "You must accept the declaration to submit";
  }

  return e;
}

/* ------------------------------------------------------------------ */
/*  File upload helper                                                 */
/* ------------------------------------------------------------------ */

async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return {
    id: data.id ?? uid(),
    name: file.name,
    url: data.url ?? "",
    size: file.size,
  };
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function EmpanelmentApplicationPage() {
  const [form, dispatch] = useReducer(formReducer, initialFormData());
  const [step, setStep] = React.useState(0);
  const [errors, setErrors] = React.useState<Errors>({});
  const [profileLoaded, setProfileLoaded] = React.useState(false);
  const [profileBanner, setProfileBanner] = React.useState<"filled" | "missing" | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [applicationNumber, setApplicationNumber] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");
  const topRef = useRef<HTMLDivElement>(null);

  /* ---- localStorage auto-save ------------------------------------ */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormData;
        dispatch({ type: "SET_FORM", payload: parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  /* ---- Auto-fill from profile ------------------------------------ */

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setProfileBanner("missing");
          return;
        }
        const profile = await res.json();
        if (!profile || !profile.fullName) {
          setProfileBanner("missing");
          return;
        }

        dispatch({
          type: "SET_PERSONAL",
          payload: {
            title: profile.title ?? "",
            fullName: profile.fullName ?? "",
            parentSpouseName: profile.parentSpouseName ?? "",
            dob: profile.dob ?? "",
            gender: profile.gender ?? "",
            nationality: profile.nationality ?? "Indian",
            aadhaar: profile.aadhaar ?? "",
            contactNo: profile.contactNo ?? "",
            altContactNo: profile.altContactNo ?? "",
            email: profile.email ?? "",
            address: profile.address ?? "",
            photoFile: profile.photoFile ?? null,
            aadhaarFile: profile.aadhaarFile ?? null,
          },
        });

        if (profile.qualifications && profile.qualifications.length > 0) {
          dispatch({
            type: "SET_QUALIFICATIONS",
            payload: profile.qualifications.map((q: Record<string, unknown>) => ({
              ...emptyQualification(),
              ...q,
              id: (q.id as string) || uid(),
              certificateFile: (q.certificateFile as UploadedFile) ?? null,
            })),
          });
        }

        if (profile.experiences && profile.experiences.length > 0) {
          dispatch({
            type: "SET_EXPERIENCES",
            payload: profile.experiences.map((x: Record<string, unknown>) => ({
              ...emptyExperience(),
              ...x,
              id: (x.id as string) || uid(),
              certificateFile: (x.certificateFile as UploadedFile) ?? null,
            })),
          });
        }

        setProfileLoaded(true);
        setProfileBanner("filled");
      } catch {
        setProfileBanner("missing");
      }
    }

    loadProfile();
  }, []);

  /* ---- Navigation ------------------------------------------------ */

  const scrollTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  }, [step, form, scrollTop]);

  const goPrev = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  }, [scrollTop]);

  /* ---- Submit ---------------------------------------------------- */

  const handleSubmit = useCallback(async () => {
    const errs = validateStep(6, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/applications/empanelment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Submission failed");
      }
      const result = await res.json();
      setApplicationNumber(result.applicationNumber ?? result.id ?? "");
      setSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  /* ---- Dynamic list helpers -------------------------------------- */

  function updateListItem<T extends { id: string }>(
    list: T[],
    id: string,
    patch: Partial<T>
  ): T[] {
    return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
  }

  function removeListItem<T extends { id: string }>(list: T[], id: string): T[] {
    return list.filter((item) => item.id !== id);
  }

  /* ---- File upload handler (generic) ----------------------------- */

  const handleFileUpload = useCallback(
    async (
      file: File,
      _keyDetails: Record<string, string>,
      callback: (uploaded: UploadedFile) => void
    ) => {
      try {
        const uploaded = await uploadFile(file);
        callback(uploaded);
      } catch {
        /* upload error handled by FileUpload component */
      }
    },
    []
  );

  /* ================================================================ */
  /*  RENDER: Success screen                                          */
  /* ================================================================ */

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Application Submitted Successfully</h1>
        {applicationNumber && (
          <p className="mt-3 text-lg text-gray-700">
            Your application number: <span className="font-semibold text-blue-700">{applicationNumber}</span>
          </p>
        )}
        <p className="mt-2 text-gray-500">
          You will receive a confirmation email shortly. You can track your application status from the dashboard.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard/applications">
            <Button variant="primary">View Applications</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER: Progress bar                                            */
  /* ================================================================ */

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  /* ================================================================ */
  /*  RENDER: Step content                                            */
  /* ================================================================ */

  function renderStep() {
    switch (step) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderCategoryDomain();
      case 2:
        return renderPreferredOffices();
      case 3:
        return renderEducation();
      case 4:
        return renderWorkExperience();
      case 5:
        return renderServiceExperience();
      case 6:
        return renderDeclaration();
      default:
        return null;
    }
  }

  /* ---- Step 1: Personal Details ---------------------------------- */

  function renderPersonalDetails() {
    const p = form.personal;
    const set = (patch: Partial<PersonalDetails>) =>
      dispatch({ type: "SET_PERSONAL", payload: patch });

    return (
      <Card title="Personal Details">
        {profileBanner === "filled" && (
          <div className="mb-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Auto-filled from your saved profile. You can edit any field below.
          </div>
        )}
        {profileBanner === "missing" && (
          <div className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            No saved profile found.{" "}
            <Link href="/dashboard/profile" className="font-medium underline">
              Complete your profile
            </Link>{" "}
            first for auto-fill, or fill in manually below.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Title"
            name="personal.title"
            required
            value={p.title}
            onChange={(e) => set({ title: e.target.value })}
            options={TITLES.map((t) => ({ value: t, label: t }))}
            placeholder="Select title"
            error={errors["personal.title"]}
          />
          <Input
            label="Full Name"
            name="personal.fullName"
            required
            value={p.fullName}
            onChange={(e) => set({ fullName: e.target.value })}
            error={errors["personal.fullName"]}
          />
          <Input
            label="Father's / Mother's / Husband's Name"
            name="personal.parentSpouseName"
            value={p.parentSpouseName}
            onChange={(e) => set({ parentSpouseName: e.target.value })}
          />
          <Input
            label="Date of Birth"
            name="personal.dob"
            type="date"
            required
            value={p.dob}
            onChange={(e) => set({ dob: e.target.value })}
            error={errors["personal.dob"]}
          />
          <Select
            label="Gender"
            name="personal.gender"
            required
            value={p.gender}
            onChange={(e) => set({ gender: e.target.value })}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            error={errors["personal.gender"]}
          />
          <Input
            label="Nationality"
            name="personal.nationality"
            required
            value={p.nationality}
            onChange={(e) => set({ nationality: e.target.value })}
            error={errors["personal.nationality"]}
          />
          <Input
            label="Aadhaar Number"
            name="personal.aadhaar"
            value={p.aadhaar}
            placeholder="XXXX XXXX XXXX"
            onChange={(e) => set({ aadhaar: e.target.value })}
            error={errors["personal.aadhaar"]}
          />
          <Input
            label="Contact No."
            name="personal.contactNo"
            required
            value={p.contactNo}
            onChange={(e) => set({ contactNo: e.target.value })}
            error={errors["personal.contactNo"]}
          />
          <Input
            label="Alt Contact No."
            name="personal.altContactNo"
            value={p.altContactNo}
            onChange={(e) => set({ altContactNo: e.target.value })}
            error={errors["personal.altContactNo"]}
          />
          <Input
            label="Email"
            name="personal.email"
            type="email"
            required
            value={p.email}
            onChange={(e) => set({ email: e.target.value })}
            error={errors["personal.email"]}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>

        <div className="mt-4">
          <TextArea
            label="Address"
            name="personal.address"
            required
            rows={3}
            value={p.address}
            onChange={(e) => set({ address: e.target.value })}
            maxLength={500}
            error={errors["personal.address"]}
          />
        </div>

        {/* Inline document uploads */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Passport Photo</h4>
            {p.photoFile ? (
              <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-3">
                <span className="text-sm text-gray-700">{p.photoFile.name}</span>
                <button
                  type="button"
                  className="ml-auto text-xs text-red-600 hover:underline"
                  onClick={() => set({ photoFile: null })}
                >
                  Remove
                </button>
              </div>
            ) : (
              <FileUpload
                documentType="photo"
                label="Upload Passport Photo"
                accept=".jpg,.jpeg,.png"
                maxSize={2}
                onUpload={(file, kd) =>
                  handleFileUpload(file, kd, (uploaded) =>
                    set({ photoFile: uploaded })
                  )
                }
              />
            )}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Aadhaar Card</h4>
            {p.aadhaarFile ? (
              <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-3">
                <span className="text-sm text-gray-700">{p.aadhaarFile.name}</span>
                <button
                  type="button"
                  className="ml-auto text-xs text-red-600 hover:underline"
                  onClick={() => set({ aadhaarFile: null })}
                >
                  Remove
                </button>
              </div>
            ) : (
              <FileUpload
                documentType="aadhaar"
                label="Upload Aadhaar Card"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(file, kd) =>
                  handleFileUpload(file, kd, (uploaded) =>
                    set({ aadhaarFile: uploaded })
                  )
                }
              />
            )}
          </div>
        </div>
      </Card>
    );
  }

  /* ---- Step 2: Category & Domain --------------------------------- */

  function renderCategoryDomain() {
    const c = form.categoryDomain;
    const set = (patch: Partial<CategoryDomain>) =>
      dispatch({ type: "SET_CATEGORY_DOMAIN", payload: patch });

    const selectedCategory = EMPANELMENT_CATEGORIES.find((cat) => cat.code === c.category);

    return (
      <Card title="Empanelment Category & Domain">
        <div className="space-y-6">
          {/* Category */}
          <div>
            <Select
              label="Category Applied For"
              name="category"
              required
              value={c.category}
              onChange={(e) => set({ category: e.target.value })}
              options={EMPANELMENT_CATEGORIES.map((cat) => ({
                value: cat.code,
                label: cat.name,
              }))}
              placeholder="Select category"
              error={errors["category"]}
            />
            {selectedCategory && (
              <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <p className="font-medium">Eligibility Criteria:</p>
                <p className="mt-1">{selectedCategory.eligibility}</p>
              </div>
            )}
          </div>

          {/* Service Type */}
          <Select
            label="Service Type"
            name="serviceType"
            required
            value={c.serviceType}
            onChange={(e) => set({ serviceType: e.target.value })}
            options={SERVICE_TYPES.map((s) => ({ value: s.code, label: s.name }))}
            placeholder="Select service type"
            error={errors["serviceType"]}
          />

          {/* Domains */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Domain(s) <span className="text-red-600">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500">Select one or more domains</p>
            {errors["domains"] && (
              <p className="mb-2 text-xs text-red-600">{errors["domains"]}</p>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NPC_DOMAINS.map((d) => (
                <label
                  key={d.code}
                  className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={c.domains.includes(d.code)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...c.domains, d.code]
                        : c.domains.filter((x) => x !== d.code);
                      set({ domains: next });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Areas of Expertise
            </label>
            <p className="mb-2 text-xs text-gray-500">Add up to 10 areas of expertise</p>
            <div className="space-y-2">
              {c.areasOfExpertise.map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    name={`expertise-${idx}`}
                    value={area}
                    placeholder={`Area of expertise ${idx + 1}`}
                    onChange={(e) => {
                      const next = [...c.areasOfExpertise];
                      next[idx] = e.target.value;
                      set({ areasOfExpertise: next });
                    }}
                    className="flex-1"
                  />
                  {c.areasOfExpertise.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = c.areasOfExpertise.filter((_, i) => i !== idx);
                        set({ areasOfExpertise: next });
                      }}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50"
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
            {c.areasOfExpertise.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => set({ areasOfExpertise: [...c.areasOfExpertise, ""] })}
              >
                + Add Area
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  /* ---- Step 3: Preferred Offices --------------------------------- */

  function renderPreferredOffices() {
    const o = form.offices;
    const set = (patch: Partial<PreferredOffices>) =>
      dispatch({ type: "SET_OFFICES", payload: patch });

    const officeOptions = NPC_OFFICES.map((off) => ({
      value: off.code,
      label: off.name,
    }));

    return (
      <Card title="Preferred Offices">
        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Are you willing to work anywhere in India?
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={o.willingAnywhere}
              onClick={() => set({ willingAnywhere: !o.willingAnywhere })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                o.willingAnywhere ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  o.willingAnywhere ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {o.willingAnywhere ? "Yes" : "No"}
            </span>
          </div>

          {!o.willingAnywhere && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Preferred Office 1"
                name="office1"
                required
                value={o.office1}
                onChange={(e) => set({ office1: e.target.value })}
                options={officeOptions}
                placeholder="Select office"
                error={errors["office1"]}
              />
              <Select
                label="Preferred Office 2 (Optional)"
                name="office2"
                value={o.office2}
                onChange={(e) => set({ office2: e.target.value })}
                options={officeOptions}
                placeholder="Select office"
              />
              <Select
                label="Preferred Office 3 (Optional)"
                name="office3"
                value={o.office3}
                onChange={(e) => set({ office3: e.target.value })}
                options={officeOptions}
                placeholder="Select office"
              />
            </div>
          )}

          {/* Reference grid */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">NPC Office Locations</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {NPC_OFFICES.map((off) => (
                <div
                  key={off.code}
                  className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">{off.code}</span>{" "}
                  <span className="text-gray-500">- {off.city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* ---- Step 4: Educational Qualifications ------------------------ */

  function renderEducation() {
    const quals = form.qualifications;

    function updateQual(id: string, patch: Partial<Qualification>) {
      dispatch({
        type: "SET_QUALIFICATIONS",
        payload: updateListItem(quals, id, patch),
      });
    }

    return (
      <Card title="Educational Qualifications">
        {profileLoaded && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
            Auto-filled from your profile. You can edit or add more entries.
          </div>
        )}
        {errors["qualifications"] && (
          <p className="mb-4 text-sm text-red-600">{errors["qualifications"]}</p>
        )}

        <div className="space-y-6">
          {quals.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Qualification {idx + 1}
                </h4>
                {quals.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_QUALIFICATIONS",
                        payload: removeListItem(quals, q.id),
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Select
                  label="Degree / Level"
                  name={`qual-degree-${q.id}`}
                  required
                  value={q.degree}
                  onChange={(e) => updateQual(q.id, { degree: e.target.value })}
                  options={QUALIFICATION_LEVELS.map((l) => ({ value: l, label: l }))}
                  placeholder="Select degree"
                  error={errors[`qual.${idx}.degree`]}
                />
                <Input
                  label="Discipline / Subject"
                  name={`qual-discipline-${q.id}`}
                  value={q.discipline}
                  onChange={(e) => updateQual(q.id, { discipline: e.target.value })}
                />
                <Input
                  label="College / Institute"
                  name={`qual-college-${q.id}`}
                  required
                  value={q.college}
                  onChange={(e) => updateQual(q.id, { college: e.target.value })}
                  error={errors[`qual.${idx}.college`]}
                />
                <Input
                  label="University / Board"
                  name={`qual-university-${q.id}`}
                  required
                  value={q.university}
                  onChange={(e) => updateQual(q.id, { university: e.target.value })}
                  error={errors[`qual.${idx}.university`]}
                />
                <Input
                  label="Year of Passing"
                  name={`qual-year-${q.id}`}
                  type="number"
                  required
                  value={q.year}
                  onChange={(e) => updateQual(q.id, { year: e.target.value })}
                  error={errors[`qual.${idx}.year`]}
                />
                <Input
                  label="Marks / CGPA"
                  name={`qual-marks-${q.id}`}
                  value={q.marks}
                  onChange={(e) => updateQual(q.id, { marks: e.target.value })}
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`highest-${q.id}`}
                  checked={q.isHighest}
                  onChange={(e) => {
                    // Uncheck others when one is checked
                    const updated = quals.map((item) => ({
                      ...item,
                      isHighest: item.id === q.id ? e.target.checked : false,
                    }));
                    dispatch({ type: "SET_QUALIFICATIONS", payload: updated });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`highest-${q.id}`} className="text-sm text-gray-700">
                  This is my highest qualification
                </label>
              </div>

              {/* Inline certificate upload */}
              <div className="mt-4">
                {q.certificateFile ? (
                  <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">{q.certificateFile.name}</span>
                    <button
                      type="button"
                      className="ml-auto text-xs text-red-600 hover:underline"
                      onClick={() => updateQual(q.id, { certificateFile: null })}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    documentType="qualification"
                    label="Upload Certificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5}
                    onUpload={(file, kd) =>
                      handleFileUpload(file, kd, (uploaded) =>
                        updateQual(q.id, { certificateFile: uploaded })
                      )
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() =>
            dispatch({
              type: "SET_QUALIFICATIONS",
              payload: [...quals, emptyQualification()],
            })
          }
        >
          + Add Qualification
        </Button>
      </Card>
    );
  }

  /* ---- Step 5: Work Experience & CV ------------------------------ */

  function renderWorkExperience() {
    const exps = form.experiences;

    function updateExp(id: string, patch: Partial<Experience>) {
      dispatch({
        type: "SET_EXPERIENCES",
        payload: updateListItem(exps, id, patch),
      });
    }

    return (
      <Card title="Work Experience & CV">
        {profileLoaded && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
            Auto-filled from your profile. You can edit or add more entries.
          </div>
        )}

        <div className="space-y-6">
          {exps.map((x, idx) => (
            <div
              key={x.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                  Experience {idx + 1}
                </h4>
                {exps.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_EXPERIENCES",
                        payload: removeListItem(exps, x.id),
                      })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Organization"
                  name={`exp-employer-${x.id}`}
                  value={x.employer}
                  onChange={(e) => updateExp(x.id, { employer: e.target.value })}
                />
                <Input
                  label="Designation"
                  name={`exp-designation-${x.id}`}
                  value={x.designation}
                  onChange={(e) => updateExp(x.id, { designation: e.target.value })}
                />
                <Select
                  label="Sector Type"
                  name={`exp-sector-${x.id}`}
                  value={x.sectorType}
                  onChange={(e) => updateExp(x.id, { sectorType: e.target.value })}
                  options={SECTOR_TYPE_OPTIONS}
                  placeholder="Select sector"
                />
                <Input
                  label="Start Date"
                  name={`exp-start-${x.id}`}
                  type="date"
                  value={x.startDate}
                  onChange={(e) => updateExp(x.id, { startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  name={`exp-end-${x.id}`}
                  type="date"
                  value={x.endDate}
                  disabled={x.currentlyWorking}
                  onChange={(e) => updateExp(x.id, { endDate: e.target.value })}
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      checked={x.currentlyWorking}
                      onChange={(e) =>
                        updateExp(x.id, {
                          currentlyWorking: e.target.checked,
                          endDate: e.target.checked ? "" : x.endDate,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Currently Working</span>
                  </label>
                </div>
              </div>

              <div className="mt-3">
                <TextArea
                  label="Duties / Responsibilities"
                  name={`exp-desc-${x.id}`}
                  value={x.description}
                  onChange={(e) => updateExp(x.id, { description: e.target.value })}
                  maxLength={400}
                  rows={2}
                />
              </div>

              {/* Inline experience certificate upload */}
              <div className="mt-4">
                {x.certificateFile ? (
                  <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">{x.certificateFile.name}</span>
                    <button
                      type="button"
                      className="ml-auto text-xs text-red-600 hover:underline"
                      onClick={() => updateExp(x.id, { certificateFile: null })}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    documentType="experience"
                    label="Upload Experience Certificate"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5}
                    onUpload={(file, kd) =>
                      handleFileUpload(file, kd, (uploaded) =>
                        updateExp(x.id, { certificateFile: uploaded })
                      )
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() =>
            dispatch({
              type: "SET_EXPERIENCES",
              payload: [...exps, emptyExperience()],
            })
          }
        >
          + Add Experience
        </Button>

        {/* Updated Signed CV upload */}
        <div className="mt-8 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-5">
          <h4 className="mb-3 text-sm font-semibold text-blue-800">
            Updated Signed CV <span className="text-red-600">*</span>
          </h4>
          {errors["cvFile"] && (
            <p className="mb-2 text-xs text-red-600">{errors["cvFile"]}</p>
          )}
          {form.cvFile ? (
            <div className="flex items-center gap-3 rounded border border-blue-200 bg-white p-3">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700">{form.cvFile.name}</span>
              <button
                type="button"
                className="ml-auto text-xs text-red-600 hover:underline"
                onClick={() => dispatch({ type: "SET_CV_FILE", payload: null })}
              >
                Remove
              </button>
            </div>
          ) : (
            <FileUpload
              documentType="cv"
              label="Upload your updated signed CV"
              accept=".pdf,.doc,.docx"
              maxSize={10}
              required
              onUpload={(file, kd) =>
                handleFileUpload(file, kd, (uploaded) =>
                  dispatch({ type: "SET_CV_FILE", payload: uploaded })
                )
              }
            />
          )}
        </div>
      </Card>
    );
  }

  /* ---- Step 6: Service Experience -------------------------------- */

  function renderServiceExperience() {
    const sType = form.categoryDomain.serviceType;
    const showConsultancy = sType === "consultancy" || sType === "both";
    const showTraining = sType === "training" || sType === "both";

    return (
      <div className="space-y-6">
        {/* Consultancy Projects */}
        {showConsultancy && (
          <Card title="Consultancy Projects">
            {form.consultancyProjects.length === 0 ? (
              <p className="text-sm text-gray-500">
                No consultancy projects added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {form.consultancyProjects.map((cp, idx) => (
                  <div
                    key={cp.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Consultancy Project {idx + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: removeListItem(form.consultancyProjects, cp.id),
                          })
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Project Title"
                        name={`cp-title-${cp.id}`}
                        value={cp.title}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              title: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="Client Organization"
                        name={`cp-org-${cp.id}`}
                        value={cp.clientOrg}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              clientOrg: e.target.value,
                            }),
                          })
                        }
                      />
                      <Select
                        label="Client Type"
                        name={`cp-ctype-${cp.id}`}
                        value={cp.clientType}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              clientType: e.target.value,
                            }),
                          })
                        }
                        options={CLIENT_TYPE_OPTIONS}
                        placeholder="Select type"
                      />
                      <Input
                        label="Start Date"
                        name={`cp-start-${cp.id}`}
                        type="date"
                        value={cp.startDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              startDate: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="End Date"
                        name={`cp-end-${cp.id}`}
                        type="date"
                        value={cp.endDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              endDate: e.target.value,
                            }),
                          })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <TextArea
                        label="Description"
                        name={`cp-desc-${cp.id}`}
                        value={cp.description}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_CONSULTANCY",
                            payload: updateListItem(form.consultancyProjects, cp.id, {
                              description: e.target.value,
                            }),
                          })
                        }
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                    {/* Inline document upload */}
                    <div className="mt-3">
                      {cp.supportingDoc ? (
                        <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{cp.supportingDoc.name}</span>
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() =>
                              dispatch({
                                type: "SET_CONSULTANCY",
                                payload: updateListItem(form.consultancyProjects, cp.id, {
                                  supportingDoc: null,
                                }),
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <FileUpload
                          documentType="experience"
                          label="Upload Supporting Document"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onUpload={(file, kd) =>
                            handleFileUpload(file, kd, (uploaded) =>
                              dispatch({
                                type: "SET_CONSULTANCY",
                                payload: updateListItem(form.consultancyProjects, cp.id, {
                                  supportingDoc: uploaded,
                                }),
                              })
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                dispatch({
                  type: "SET_CONSULTANCY",
                  payload: [...form.consultancyProjects, emptyConsultancy()],
                })
              }
            >
              + Add Consultancy Project
            </Button>
          </Card>
        )}

        {/* Action Research Projects */}
        {showConsultancy && (
          <Card title="Action Research Projects">
            {form.researchProjects.length === 0 ? (
              <p className="text-sm text-gray-500">
                No action research projects added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {form.researchProjects.map((rp, idx) => (
                  <div
                    key={rp.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Research Project {idx + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: removeListItem(form.researchProjects, rp.id),
                          })
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Project Title"
                        name={`rp-title-${rp.id}`}
                        value={rp.title}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              title: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="Client Organization"
                        name={`rp-org-${rp.id}`}
                        value={rp.clientOrg}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              clientOrg: e.target.value,
                            }),
                          })
                        }
                      />
                      <Select
                        label="Client Type"
                        name={`rp-ctype-${rp.id}`}
                        value={rp.clientType}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              clientType: e.target.value,
                            }),
                          })
                        }
                        options={CLIENT_TYPE_OPTIONS}
                        placeholder="Select type"
                      />
                      <Input
                        label="Start Date"
                        name={`rp-start-${rp.id}`}
                        type="date"
                        value={rp.startDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              startDate: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="End Date"
                        name={`rp-end-${rp.id}`}
                        type="date"
                        value={rp.endDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              endDate: e.target.value,
                            }),
                          })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <TextArea
                        label="Description"
                        name={`rp-desc-${rp.id}`}
                        value={rp.description}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_RESEARCH",
                            payload: updateListItem(form.researchProjects, rp.id, {
                              description: e.target.value,
                            }),
                          })
                        }
                        rows={2}
                        maxLength={500}
                      />
                    </div>
                    <div className="mt-3">
                      {rp.supportingDoc ? (
                        <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{rp.supportingDoc.name}</span>
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() =>
                              dispatch({
                                type: "SET_RESEARCH",
                                payload: updateListItem(form.researchProjects, rp.id, {
                                  supportingDoc: null,
                                }),
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <FileUpload
                          documentType="experience"
                          label="Upload Supporting Document"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onUpload={(file, kd) =>
                            handleFileUpload(file, kd, (uploaded) =>
                              dispatch({
                                type: "SET_RESEARCH",
                                payload: updateListItem(form.researchProjects, rp.id, {
                                  supportingDoc: uploaded,
                                }),
                              })
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                dispatch({
                  type: "SET_RESEARCH",
                  payload: [...form.researchProjects, emptyConsultancy()],
                })
              }
            >
              + Add Research Project
            </Button>
          </Card>
        )}

        {/* Training Programs Conducted */}
        {showTraining && (
          <Card title="Training Programs Conducted">
            {form.trainingPrograms.length === 0 ? (
              <p className="text-sm text-gray-500">
                No training programs added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {form.trainingPrograms.map((tp, idx) => (
                  <div
                    key={tp.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Training Program {idx + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: removeListItem(form.trainingPrograms, tp.id),
                          })
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Training Title"
                        name={`tp-title-${tp.id}`}
                        value={tp.title}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              title: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="Client Organization"
                        name={`tp-org-${tp.id}`}
                        value={tp.clientOrg}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              clientOrg: e.target.value,
                            }),
                          })
                        }
                      />
                      <Select
                        label="Client Type"
                        name={`tp-ctype-${tp.id}`}
                        value={tp.clientType}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              clientType: e.target.value,
                            }),
                          })
                        }
                        options={CLIENT_TYPE_OPTIONS}
                        placeholder="Select type"
                      />
                      <Select
                        label="Training Mode"
                        name={`tp-mode-${tp.id}`}
                        value={tp.trainingMode}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              trainingMode: e.target.value,
                            }),
                          })
                        }
                        options={TRAINING_MODE_OPTIONS}
                        placeholder="Select mode"
                      />
                      <Input
                        label="Start Date"
                        name={`tp-start-${tp.id}`}
                        type="date"
                        value={tp.startDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              startDate: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="End Date"
                        name={`tp-end-${tp.id}`}
                        type="date"
                        value={tp.endDate}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              endDate: e.target.value,
                            }),
                          })
                        }
                      />
                      <Input
                        label="Number of Participants"
                        name={`tp-participants-${tp.id}`}
                        type="number"
                        value={tp.participants}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_TRAINING",
                            payload: updateListItem(form.trainingPrograms, tp.id, {
                              participants: e.target.value,
                            }),
                          })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      {tp.supportingDoc ? (
                        <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{tp.supportingDoc.name}</span>
                          <button
                            type="button"
                            className="ml-auto text-xs text-red-600 hover:underline"
                            onClick={() =>
                              dispatch({
                                type: "SET_TRAINING",
                                payload: updateListItem(form.trainingPrograms, tp.id, {
                                  supportingDoc: null,
                                }),
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <FileUpload
                          documentType="experience"
                          label="Upload Supporting Document"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onUpload={(file, kd) =>
                            handleFileUpload(file, kd, (uploaded) =>
                              dispatch({
                                type: "SET_TRAINING",
                                payload: updateListItem(form.trainingPrograms, tp.id, {
                                  supportingDoc: uploaded,
                                }),
                              })
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                dispatch({
                  type: "SET_TRAINING",
                  payload: [...form.trainingPrograms, emptyTraining()],
                })
              }
            >
              + Add Training Program
            </Button>
          </Card>
        )}

        {!showConsultancy && !showTraining && (
          <Card>
            <p className="text-sm text-gray-500">
              Please select a service type in Step 2 to see relevant service experience sections.
            </p>
          </Card>
        )}

        {/* Certifications */}
        <Card title="Certifications">
          {form.certifications.length === 0 ? (
            <p className="text-sm text-gray-500">No certifications added yet.</p>
          ) : (
            <div className="space-y-4">
              {form.certifications.map((cert, idx) => (
                <div
                  key={cert.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Certification {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_CERTIFICATIONS",
                          payload: removeListItem(form.certifications, cert.id),
                        })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Certification Name"
                      name={`cert-name-${cert.id}`}
                      value={cert.name}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_CERTIFICATIONS",
                          payload: updateListItem(form.certifications, cert.id, {
                            name: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="Issuing Organization"
                      name={`cert-org-${cert.id}`}
                      value={cert.issuingOrg}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_CERTIFICATIONS",
                          payload: updateListItem(form.certifications, cert.id, {
                            issuingOrg: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="Date Obtained"
                      name={`cert-date-${cert.id}`}
                      type="date"
                      value={cert.dateObtained}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_CERTIFICATIONS",
                          payload: updateListItem(form.certifications, cert.id, {
                            dateObtained: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="Valid Till"
                      name={`cert-valid-${cert.id}`}
                      type="date"
                      value={cert.validTill}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_CERTIFICATIONS",
                          payload: updateListItem(form.certifications, cert.id, {
                            validTill: e.target.value,
                          }),
                        })
                      }
                    />
                  </div>
                  <div className="mt-3">
                    {cert.certificateFile ? (
                      <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700">{cert.certificateFile.name}</span>
                        <button
                          type="button"
                          className="ml-auto text-xs text-red-600 hover:underline"
                          onClick={() =>
                            dispatch({
                              type: "SET_CERTIFICATIONS",
                              payload: updateListItem(form.certifications, cert.id, {
                                certificateFile: null,
                              }),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <FileUpload
                        documentType="qualification"
                        label="Upload Certificate"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        onUpload={(file, kd) =>
                          handleFileUpload(file, kd, (uploaded) =>
                            dispatch({
                              type: "SET_CERTIFICATIONS",
                              payload: updateListItem(form.certifications, cert.id, {
                                certificateFile: uploaded,
                              }),
                            })
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() =>
              dispatch({
                type: "SET_CERTIFICATIONS",
                payload: [...form.certifications, emptyCertification()],
              })
            }
          >
            + Add Certification
          </Button>
        </Card>

        {/* Professional Memberships */}
        <Card title="Professional Memberships">
          {form.memberships.length === 0 ? (
            <p className="text-sm text-gray-500">No memberships added yet.</p>
          ) : (
            <div className="space-y-4">
              {form.memberships.map((m, idx) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Membership {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_MEMBERSHIPS",
                          payload: removeListItem(form.memberships, m.id),
                        })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="Institution"
                      name={`mem-inst-${m.id}`}
                      value={m.institution}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_MEMBERSHIPS",
                          payload: updateListItem(form.memberships, m.id, {
                            institution: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="Membership Type"
                      name={`mem-type-${m.id}`}
                      value={m.membershipType}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_MEMBERSHIPS",
                          payload: updateListItem(form.memberships, m.id, {
                            membershipType: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="From"
                      name={`mem-from-${m.id}`}
                      type="date"
                      value={m.fromDate}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_MEMBERSHIPS",
                          payload: updateListItem(form.memberships, m.id, {
                            fromDate: e.target.value,
                          }),
                        })
                      }
                    />
                    <Input
                      label="To"
                      name={`mem-to-${m.id}`}
                      type="date"
                      value={m.toDate}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_MEMBERSHIPS",
                          payload: updateListItem(form.memberships, m.id, {
                            toDate: e.target.value,
                          }),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() =>
              dispatch({
                type: "SET_MEMBERSHIPS",
                payload: [...form.memberships, emptyMembership()],
              })
            }
          >
            + Add Membership
          </Button>
        </Card>
      </div>
    );
  }

  /* ---- Step 7: Declaration & Submit ------------------------------ */

  function renderDeclaration() {
    const p = form.personal;
    const c = form.categoryDomain;
    const o = form.offices;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <Card title="Application Summary">
          {/* Personal */}
          <div className="mb-6">
            <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <p><span className="text-gray-500">Name:</span> {p.title} {p.fullName}</p>
              {p.parentSpouseName && <p><span className="text-gray-500">Father/Mother/Spouse:</span> {p.parentSpouseName}</p>}
              <p><span className="text-gray-500">DOB:</span> {p.dob}</p>
              <p><span className="text-gray-500">Gender:</span> {p.gender}</p>
              <p><span className="text-gray-500">Nationality:</span> {p.nationality}</p>
              <p><span className="text-gray-500">Contact:</span> {p.contactNo}</p>
              <p><span className="text-gray-500">Email:</span> {p.email}</p>
              <p className="sm:col-span-2"><span className="text-gray-500">Address:</span> {p.address}</p>
            </div>
          </div>

          {/* Category & Domain */}
          <div className="mb-6">
            <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
              Category & Domain
            </h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <p>
                <span className="text-gray-500">Category:</span>{" "}
                {EMPANELMENT_CATEGORIES.find((cat) => cat.code === c.category)?.name ?? c.category}
              </p>
              <p>
                <span className="text-gray-500">Service Type:</span>{" "}
                {SERVICE_TYPES.find((s) => s.code === c.serviceType)?.name ?? c.serviceType}
              </p>
              <p className="sm:col-span-2">
                <span className="text-gray-500">Domains:</span>{" "}
                {c.domains
                  .map((d) => NPC_DOMAINS.find((nd) => nd.code === d)?.name ?? d)
                  .join(", ")}
              </p>
              {c.areasOfExpertise.filter(Boolean).length > 0 && (
                <p className="sm:col-span-2">
                  <span className="text-gray-500">Expertise:</span>{" "}
                  {c.areasOfExpertise.filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Offices */}
          <div className="mb-6">
            <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
              Preferred Offices
            </h4>
            <p className="text-sm">
              {o.willingAnywhere
                ? "Willing to work anywhere in India"
                : [o.office1, o.office2, o.office3]
                    .filter(Boolean)
                    .map((code) => NPC_OFFICES.find((off) => off.code === code)?.name ?? code)
                    .join(", ")}
            </p>
          </div>

          {/* Qualifications */}
          <div className="mb-6">
            <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
              Educational Qualifications ({form.qualifications.length})
            </h4>
            {form.qualifications.map((q, i) => (
              <p key={q.id} className="text-sm text-gray-700">
                {i + 1}. {q.degree} - {q.discipline || "N/A"}, {q.college}, {q.university} ({q.year})
                {q.isHighest && <span className="ml-1 text-xs text-blue-600">[Highest]</span>}
                {q.certificateFile && <span className="ml-1 text-xs text-green-600">[Doc attached]</span>}
              </p>
            ))}
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
              Work Experience ({form.experiences.length})
            </h4>
            {form.experiences.map((x, i) => (
              <p key={x.id} className="text-sm text-gray-700">
                {i + 1}. {x.designation || "N/A"} at {x.employer || "N/A"} ({x.startDate} - {x.currentlyWorking ? "Present" : x.endDate})
                {x.certificateFile && <span className="ml-1 text-xs text-green-600">[Doc attached]</span>}
              </p>
            ))}
            {form.cvFile && (
              <p className="mt-1 text-sm text-green-700">CV uploaded: {form.cvFile.name}</p>
            )}
          </div>

          {/* Service experience summary */}
          {form.consultancyProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
                Consultancy Projects ({form.consultancyProjects.length})
              </h4>
              {form.consultancyProjects.map((cp, i) => (
                <p key={cp.id} className="text-sm text-gray-700">
                  {i + 1}. {cp.title || "N/A"} - {cp.clientOrg || "N/A"} ({cp.startDate} - {cp.endDate})
                </p>
              ))}
            </div>
          )}
          {form.researchProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
                Action Research Projects ({form.researchProjects.length})
              </h4>
              {form.researchProjects.map((rp, i) => (
                <p key={rp.id} className="text-sm text-gray-700">
                  {i + 1}. {rp.title || "N/A"} - {rp.clientOrg || "N/A"} ({rp.startDate} - {rp.endDate})
                </p>
              ))}
            </div>
          )}
          {form.trainingPrograms.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
                Training Programs ({form.trainingPrograms.length})
              </h4>
              {form.trainingPrograms.map((tp, i) => (
                <p key={tp.id} className="text-sm text-gray-700">
                  {i + 1}. {tp.title || "N/A"} - {tp.clientOrg || "N/A"} ({tp.startDate} - {tp.endDate}), {tp.participants} participants
                </p>
              ))}
            </div>
          )}
          {form.certifications.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
                Certifications ({form.certifications.length})
              </h4>
              {form.certifications.map((cert, i) => (
                <p key={cert.id} className="text-sm text-gray-700">
                  {i + 1}. {cert.name} - {cert.issuingOrg} ({cert.dateObtained})
                </p>
              ))}
            </div>
          )}
          {form.memberships.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-800">
                Professional Memberships ({form.memberships.length})
              </h4>
              {form.memberships.map((m, i) => (
                <p key={m.id} className="text-sm text-gray-700">
                  {i + 1}. {m.institution} - {m.membershipType} ({m.fromDate} - {m.toDate})
                </p>
              ))}
            </div>
          )}
        </Card>

        {/* Terms & Declaration */}
        <Card title="Terms & Declaration">
          <div className="space-y-4">
            <div className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-3">
              <p>
                1. The empanelled applicant will be offered contractual engagement on
                project/program basis as per the requirements of NPC and the terms and
                conditions of the engagement.
              </p>
              <p>
                2. The empanelled applicant is expected to travel to any location within
                or outside India as required for project/program assignments.
              </p>
              <p>
                3. NPC may issue a letter of empanelment based on the documents submitted
                and verification of credentials. Empanelment does not guarantee any
                engagement or assignment.
              </p>
              <p>
                4. NPC reserves the right to reject any application without assigning any
                reason thereof, and to cancel empanelment at any time if information
                provided is found to be incorrect or misleading.
              </p>
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.declarationAccepted}
                  onChange={(e) =>
                    dispatch({ type: "SET_DECLARATION", payload: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800">
                  I hereby acknowledge that I have read, understand and agree to the terms
                  &amp; conditions of this empanelment process. I hereby declare that the
                  information given in this application is true and correct to the best of
                  my knowledge and belief.
                </span>
              </label>
              {errors["declaration"] && (
                <p className="mt-2 text-xs text-red-600">{errors["declaration"]}</p>
              )}
            </div>

            {submitError && (
              <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  /* ================================================================ */
  /*  MAIN RENDER                                                      */
  /* ================================================================ */

  return (
    <div ref={topRef} className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Empanelment Application
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          National Productivity Council - Panel of Experts
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Step labels */}
        <div className="mt-3 hidden gap-1 sm:flex">
          {STEPS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                // Allow navigating back to completed steps only
                if (i < step) {
                  setErrors({});
                  setStep(i);
                  scrollTop();
                }
              }}
              className={`flex-1 rounded px-1 py-1.5 text-center text-xs transition-colors ${
                i === step
                  ? "bg-blue-100 font-semibold text-blue-800"
                  : i < step
                  ? "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                  : "bg-gray-50 text-gray-400 cursor-default"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          {step > 0 && (
            <Button variant="outline" onClick={goPrev}>
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              loading={submitting}
              disabled={!form.declarationAccepted}
              onClick={handleSubmit}
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
