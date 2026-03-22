"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import {
  DESIGNATIONS,
  NPC_DOMAINS,
  ENGAGEMENT_TYPES,
  NPC_OFFICES,
} from "@/lib/constants";
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

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

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

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
  const [status, setStatus] = useState("active");
  const [applicationCount, setApplicationCount] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Confirmation modals
  const [confirmAction, setConfirmAction] = useState<"close" | "cancel" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
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
          maxAgeLimitYears: post.maxAgeLimitYears ? String(post.maxAgeLimitYears) : "",
          remunerationRange: post.remunerationRange || "",
          contractPeriod: post.contractPeriod || "",
          eligibilityCriteria: post.eligibilityCriteria || "",
          workResponsibilities: post.workResponsibilities || "",
          termsAndConditions: post.termsAndConditions || STANDARD_TNC,
          applicationDeadline: post.applicationDeadline
            ? new Date(post.applicationDeadline).toISOString().split("T")[0]
            : "",
        });
        setStatus(post.status || "active");
        setApplicationCount(post._count?.applications ?? 0);
      } catch (err) {
        console.error("Fetch post error:", err);
        setSubmitError("Failed to load post data.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  // Auto-fill fields when designation changes
  const handleDesignationChange = useCallback((roleCode: string) => {
    const designation = DESIGNATIONS.find((d) => d.code === roleCode);
    if (!designation) return;

    const updates: Partial<FormData> = {
      functionalRole: roleCode,
      minQualification: designation.minQualification,
      minExperienceYears: String(designation.minExperience),
    };

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
    } else if ("monthlyRemuneration" in designation && designation.monthlyRemuneration) {
      updates.remunerationRange = `Rs. ${(designation.monthlyRemuneration as number).toLocaleString("en-IN")}/month`;
    }

    if ("maxAge" in designation && designation.maxAge) {
      updates.maxAgeLimitYears = String(designation.maxAge);
    }

    if ("maxTenure" in designation && designation.maxTenure) {
      updates.contractPeriod = designation.maxTenure as string;
    }

    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMessage("");

    if (name === "functionalRole") {
      handleDesignationChange(value);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.advertisementNo.trim()) newErrors.advertisementNo = "Advertisement number is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.functionalRole) newErrors.functionalRole = "Functional role is required";
    if (!form.domain) newErrors.domain = "Domain is required";
    if (!form.engagementType) newErrors.engagementType = "Engagement type is required";
    if (!form.placeOfDeployment) newErrors.placeOfDeployment = "Place of deployment is required";
    if (!form.minQualification.trim()) newErrors.minQualification = "Minimum qualification is required";
    if (!form.eligibilityCriteria.trim()) newErrors.eligibilityCriteria = "Eligibility criteria is required";
    if (!form.workResponsibilities.trim()) newErrors.workResponsibilities = "Work responsibilities is required";
    if (!form.applicationDeadline) newErrors.applicationDeadline = "Application deadline is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setSubmitError("");
      setSuccessMessage("");

      const payload = {
        ...form,
        numberOfPositions: parseInt(form.numberOfPositions, 10) || 1,
        minExperienceYears: parseInt(form.minExperienceYears, 10) || 0,
        maxAgeLimitYears: form.maxAgeLimitYears ? parseInt(form.maxAgeLimitYears, 10) : null,
        status,
      };

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to update post requirement.");
        return;
      }

      setSuccessMessage("Post updated successfully.");
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusAction = async (newStatus: string) => {
    try {
      setActionLoading(true);
      setSubmitError("");
      setSuccessMessage("");

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Failed to update post status.");
        return;
      }

      setStatus(newStatus);
      setSuccessMessage(`Post status changed to "${newStatus.replace(/_/g, " ")}".`);
    } catch (err) {
      console.error("Status update error:", err);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const designationOptions = DESIGNATIONS.map((d) => ({ value: d.code, label: d.name }));
  const domainOptions = NPC_DOMAINS.map((d) => ({ value: d.code, label: d.name }));
  const engagementTypeOptions = ENGAGEMENT_TYPES.map((t) => ({ value: t.code, label: t.name }));
  const officeOptions = NPC_OFFICES.map((o) => ({ value: o.code, label: o.name }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Post Requirement</h1>
            <p className="mt-1 text-sm text-gray-500">{form.advertisementNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            label={status.replace(/_/g, " ")}
            status={status}
            size="md"
          />
          <span className="text-sm text-gray-500">
            {applicationCount} application{applicationCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Status Actions */}
      <Card title="Post Status & Actions">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <div className="flex items-end gap-2 pb-1">
            {status !== "on_hold" && status !== "closed" && status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusAction("on_hold")}
                loading={actionLoading}
              >
                Put on Hold
              </Button>
            )}
            {status === "on_hold" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusAction("active")}
                loading={actionLoading}
              >
                Reactivate
              </Button>
            )}
            {status !== "closed" && status !== "cancelled" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction("close")}
                >
                  Close Post
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmAction("cancel")}
                >
                  Cancel Post
                </Button>
              </>
            )}
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Applications received: <span className="font-semibold text-gray-900">{applicationCount}</span>
          </div>
        </div>
      </Card>

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
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Back to Posts
          </Button>
          <Button type="submit" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Confirmation Modal for Close */}
      <Modal
        isOpen={confirmAction === "close"}
        onClose={() => setConfirmAction(null)}
        title="Close Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to close this post? No new applications will be accepted.
            This post has <span className="font-semibold">{applicationCount}</span> application{applicationCount !== 1 ? "s" : ""}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={actionLoading}
              onClick={() => handleStatusAction("closed")}
            >
              Confirm Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Cancel */}
      <Modal
        isOpen={confirmAction === "cancel"}
        onClose={() => setConfirmAction(null)}
        title="Cancel Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this post? This action marks the post as cancelled.
            This post has <span className="font-semibold">{applicationCount}</span> application{applicationCount !== 1 ? "s" : ""}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>
              Go Back
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              loading={actionLoading}
              onClick={() => handleStatusAction("cancelled")}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
