"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import {
  DESIGNATIONS,
  NPC_DOMAINS,
  ENGAGEMENT_TYPES,
  NPC_OFFICES,
} from "@/lib/constants";
import { AlertCircle, ArrowLeft } from "lucide-react";

const STANDARD_TNC = `1. The engagement is purely on contractual basis and does not confer any right for regular appointment in NPC.
2. The contractual personnel shall not claim any benefit, compensation, regular absorption, or any other right available to regular employees.
3. The engagement can be terminated by either party by giving one month notice or one month remuneration in lieu thereof.
4. The contractual personnel shall maintain secrecy and confidentiality of official information/data.
5. The contractual personnel shall abide by all rules, regulations, and instructions issued by NPC from time to time.
6. Leave entitlement shall be as per AI 858 guidelines - maximum 1.5 days per month of completed service.
7. Performance shall be reviewed periodically as per the Performance Assessment framework (Annex-IV of AI 858).
8. Renewal of contract is subject to satisfactory performance and organizational requirement.`;

interface FormData {
  advertisementNo: string;
  title: string;
  functionalRole: string;
  domain: string;
  engagementType: string;
  numberOfPositions: string;
  placeOfDeployment: string;
  minQualification: string;
  minExperienceYears: string;
  maxAgeLimitYears: string;
  remunerationRange: string;
  contractPeriod: string;
  eligibilityCriteria: string;
  workResponsibilities: string;
  termsAndConditions: string;
  applicationDeadline: string;
}

export default function CreateEditPost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [form, setForm] = useState<FormData>({
    advertisementNo: "",
    title: "",
    functionalRole: "",
    domain: "",
    engagementType: "",
    numberOfPositions: "1",
    placeOfDeployment: "",
    minQualification: "",
    minExperienceYears: "0",
    maxAgeLimitYears: "",
    remunerationRange: "",
    contractPeriod: "",
    eligibilityCriteria: "",
    workResponsibilities: "",
    termsAndConditions: STANDARD_TNC,
    applicationDeadline: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(!!editId);

  // Fetch post data if editing
  useEffect(() => {
    if (!editId) return;

    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${editId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        const post = data.post;
        setForm({
          advertisementNo: post.advertisementNo || "",
          title: post.title || "",
          functionalRole: post.functionalRole || "",
          domain: post.domain || "",
          engagementType: post.engagementType || "",
          numberOfPositions: String(post.numberOfPositions || 1),
          placeOfDeployment: post.placeOfDeployment || "",
          minQualification: post.minQualification || "",
          minExperienceYears: String(post.minExperienceYears ?? 0),
          maxAgeLimitYears: post.maxAgeLimitYears
            ? String(post.maxAgeLimitYears)
            : "",
          remunerationRange: post.remunerationRange || "",
          contractPeriod: post.contractPeriod || "",
          eligibilityCriteria: post.eligibilityCriteria || "",
          workResponsibilities: post.workResponsibilities || "",
          termsAndConditions: post.termsAndConditions || STANDARD_TNC,
          applicationDeadline: post.applicationDeadline
            ? new Date(post.applicationDeadline).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        console.error("Fetch post error:", err);
        setSubmitError("Failed to load post data.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [editId]);

  // Auto-fill fields when designation changes
  const handleDesignationChange = useCallback(
    (roleCode: string) => {
      const designation = DESIGNATIONS.find((d) => d.code === roleCode);
      if (!designation) return;

      const updates: Partial<FormData> = {
        functionalRole: roleCode,
        minQualification: designation.minQualification,
        minExperienceYears: String(designation.minExperience),
      };

      // Build remuneration range from the designation matrix
      if ("maxRemuneration" in designation && designation.maxRemuneration) {
        const remu = designation.maxRemuneration as Record<number, number>;
        const values = Object.values(remu).filter((v) => v > 0);
        if (values.length > 0) {
          const min = Math.min(...values);
          const max = Math.max(...values);
          updates.remunerationRange =
            min === max
              ? `Rs. ${min.toLocaleString("en-IN")}/month`
              : `Rs. ${min.toLocaleString("en-IN")} - ${max.toLocaleString("en-IN")}/month`;
        }
      } else if (
        "monthlyRemuneration" in designation &&
        designation.monthlyRemuneration
      ) {
        updates.remunerationRange = `Rs. ${(designation.monthlyRemuneration as number).toLocaleString("en-IN")}/month`;
      }

      if ("maxAge" in designation && designation.maxAge) {
        updates.maxAgeLimitYears = String(designation.maxAge);
      }

      if ("maxTenure" in designation && designation.maxTenure) {
        updates.contractPeriod = designation.maxTenure as string;
      }

      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "functionalRole") {
      handleDesignationChange(value);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.advertisementNo.trim())
      newErrors.advertisementNo = "Advertisement number is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.functionalRole)
      newErrors.functionalRole = "Functional role is required";
    if (!form.domain) newErrors.domain = "Domain is required";
    if (!form.engagementType)
      newErrors.engagementType = "Engagement type is required";
    if (!form.placeOfDeployment)
      newErrors.placeOfDeployment = "Place of deployment is required";
    if (!form.minQualification.trim())
      newErrors.minQualification = "Minimum qualification is required";
    if (!form.eligibilityCriteria.trim())
      newErrors.eligibilityCriteria = "Eligibility criteria is required";
    if (!form.workResponsibilities.trim())
      newErrors.workResponsibilities = "Work responsibilities is required";
    if (!form.applicationDeadline)
      newErrors.applicationDeadline = "Application deadline is required";
    else if (new Date(form.applicationDeadline) <= new Date()) {
      newErrors.applicationDeadline = "Deadline must be a future date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setSubmitError("");

      const payload = {
        ...form,
        numberOfPositions: parseInt(form.numberOfPositions, 10) || 1,
        minExperienceYears: parseInt(form.minExperienceYears, 10) || 0,
        maxAgeLimitYears: form.maxAgeLimitYears
          ? parseInt(form.maxAgeLimitYears, 10)
          : null,
      };

      const url = editId ? `/api/posts/${editId}` : "/api/posts";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to save post requirement.");
        return;
      }

      router.push("/admin/posts");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const designationOptions = DESIGNATIONS.map((d) => ({
    value: d.code,
    label: d.name,
  }));

  const domainOptions = NPC_DOMAINS.map((d) => ({
    value: d.code,
    label: d.name,
  }));

  const engagementTypeOptions = ENGAGEMENT_TYPES.map((t) => ({
    value: t.code,
    label: t.name,
  }));

  const officeOptions = NPC_OFFICES.map((o) => ({
    value: o.code,
    label: o.name,
  }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? "Edit Post Requirement" : "Create Post Requirement"}
        </h1>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Advertisement No"
              name="advertisementNo"
              value={form.advertisementNo}
              onChange={handleChange}
              error={errors.advertisementNo}
              required
              placeholder="e.g., NPC/2026/01"
            />
            <Input
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder="Post title"
            />
            <Select
              label="Functional Role"
              name="functionalRole"
              value={form.functionalRole}
              onChange={handleChange}
              options={designationOptions}
              error={errors.functionalRole}
              required
              placeholder="Select designation"
            />
            <Select
              label="Domain"
              name="domain"
              value={form.domain}
              onChange={handleChange}
              options={domainOptions}
              error={errors.domain}
              required
              placeholder="Select domain"
            />
            <Select
              label="Engagement Type"
              name="engagementType"
              value={form.engagementType}
              onChange={handleChange}
              options={engagementTypeOptions}
              error={errors.engagementType}
              required
              placeholder="Select engagement type"
            />
            <Input
              label="Number of Positions"
              name="numberOfPositions"
              type="number"
              value={form.numberOfPositions}
              onChange={handleChange}
              placeholder="1"
            />
            <Select
              label="Place of Deployment"
              name="placeOfDeployment"
              value={form.placeOfDeployment}
              onChange={handleChange}
              options={officeOptions}
              error={errors.placeOfDeployment}
              required
              placeholder="Select office"
            />
            <Input
              label="Application Deadline"
              name="applicationDeadline"
              type="date"
              value={form.applicationDeadline}
              onChange={handleChange}
              error={errors.applicationDeadline}
              required
            />
          </div>
        </Card>

        <Card title="Qualification & Experience">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextArea
                label="Minimum Qualification"
                name="minQualification"
                value={form.minQualification}
                onChange={handleChange}
                error={errors.minQualification}
                required
                rows={3}
                placeholder="Auto-filled from selected designation"
              />
            </div>
            <Input
              label="Minimum Experience (Years)"
              name="minExperienceYears"
              type="number"
              value={form.minExperienceYears}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Max Age Limit (Years)"
              name="maxAgeLimitYears"
              type="number"
              value={form.maxAgeLimitYears}
              onChange={handleChange}
              placeholder="e.g., 65"
            />
            <Input
              label="Remuneration Range"
              name="remunerationRange"
              value={form.remunerationRange}
              onChange={handleChange}
              placeholder="Auto-filled from designation matrix"
            />
            <Input
              label="Contract Period"
              name="contractPeriod"
              value={form.contractPeriod}
              onChange={handleChange}
              placeholder="e.g., 1 year, 3 years"
            />
          </div>
        </Card>

        <Card title="Details">
          <div className="space-y-4">
            <TextArea
              label="Eligibility Criteria"
              name="eligibilityCriteria"
              value={form.eligibilityCriteria}
              onChange={handleChange}
              error={errors.eligibilityCriteria}
              required
              rows={5}
              placeholder="Detailed eligibility criteria for applicants"
            />
            <TextArea
              label="Work Responsibilities"
              name="workResponsibilities"
              value={form.workResponsibilities}
              onChange={handleChange}
              error={errors.workResponsibilities}
              required
              rows={5}
              placeholder="Key responsibilities and deliverables"
            />
            <TextArea
              label="Terms and Conditions"
              name="termsAndConditions"
              value={form.termsAndConditions}
              onChange={handleChange}
              rows={8}
              placeholder="Pre-filled with standard T&C from AI 858"
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/posts")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {editId ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
