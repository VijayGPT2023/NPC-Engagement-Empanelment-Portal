import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Target,
  TrendingUp,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";

export const metadata = { title: "Types of Engagement - NPC Portal" };

const engagementTypes = [
  {
    id: "full-part-time",
    icon: Briefcase,
    title: "A.1 Full-time / Part-time Basis",
    color: "border-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    content: [
      "Full-time engagement: consolidated monthly remuneration as per the Remuneration Matrix (Annexure II-A and II-B).",
      "Part-time engagement: per-day remuneration basis, subject to a maximum of 15 days/month and not more than 90 days in a year.",
      "Remuneration depends on designation, qualification, and years of relevant experience.",
    ],
  },
  {
    id: "lump-sum",
    icon: Target,
    title: "A.2 Lump Sum Basis",
    color: "border-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    content: [
      "Based on delivery of defined milestones within a particular time period.",
      "For domain experts with minimum qualification of graduation from a Govt recognized University/Institution.",
      "Minimum 12 years of relevant work experience required.",
      "Payment on progressive/milestone basis on each receipt of bill amount by NPC.",
      "Maximum lump sum is calculated as a percentage of project value: 20% (up to 25L), 15% (25L-100L), 10% (above 100L).",
    ],
  },
  {
    id: "revenue-sharing",
    icon: TrendingUp,
    title: "A.3 Revenue Sharing Basis",
    color: "border-teal-500",
    bg: "bg-teal-50",
    text: "text-teal-700",
    content: [
      "For reputed domain experts with minimum 15 years of relevant experience.",
      "Engaged for bringing new assignments and projects to NPC through their expertise.",
      "Remuneration is linked to successful completion and value of the engagement.",
    ],
  },
  {
    id: "resource-person",
    icon: GraduationCap,
    title: "A.4 Resource Persons for Capacity Development / Training",
    color: "border-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
    content: [
      "For taking lessons in training programmes, seminars, workshops, and webinars.",
      "Engaged in areas where NPC does not have adequate in-house expertise.",
      "Session-based honorarium as per the Resource Person Honorarium Matrix.",
      "If engaged for a full day (4 sessions minimum), honorarium will not exceed 2.5 times the per-session rate.",
    ],
  },
];

export default function EngagementTypesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-800 via-orange-700 to-orange-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-orange-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Types of Engagement
          </h1>
          <p className="mt-3 max-w-2xl text-orange-100">
            NPC offers multiple modes of contractual engagement depending on the
            nature of work and expertise required
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Engagement Types */}
        <div className="space-y-8">
          {engagementTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`rounded-lg border-l-4 ${type.color} bg-white p-6 shadow-sm`}
              >
                <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${type.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${type.text}`} />
                  </div>
                  {type.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {type.content.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Selection Process — Applicant perspective */}
        <div className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            What Happens After You Apply?
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-blue-600" />

          <div className="mt-8">
            <div className="mt-4 space-y-4">
              {[
                {
                  step: 1,
                  title: "Application Submitted",
                  desc: "Your application is received and assigned a unique application number. You can track its status from your dashboard.",
                },
                {
                  step: 2,
                  title: "Screening",
                  desc: "A Screening Committee reviews all applications and shortlists eligible candidates based on qualification and experience criteria as per the advertisement.",
                },
                {
                  step: 3,
                  title: "Selection / Interview",
                  desc: "A Selection Committee may conduct online or physical interaction with shortlisted candidates to assess suitability.",
                },
                {
                  step: 4,
                  title: "Offer of Engagement",
                  desc: "Selected candidates are issued an offer of engagement. You will be notified via email and your dashboard.",
                },
                {
                  step: 5,
                  title: "Document Verification & Joining",
                  desc: "You must produce original documents and certificates in support of age, qualification and experience at the time of joining.",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-orange-50 p-6">
          <div>
            <h3 className="font-semibold text-orange-900">
              Want to know the remuneration for each type?
            </h3>
            <p className="mt-1 text-sm text-orange-700">
              See the full salary structure including all annexures.
            </p>
          </div>
          <Link
            href="/information/salary-structure"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-800"
          >
            View Salary Structure
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/information"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Information Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
