import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  CheckCircle2,
  MapPin,
  Info,
} from "lucide-react";

export const metadata = { title: "Empanelment Guide - NPC Portal" };

const eligibility = [
  {
    category: "Advisor",
    criteria:
      "Minimum 20 years in Group A with at least 10 years in Level-12/13 or above; OR from open market with Doctorate and 25 years professional standing",
    remarks: "Highest level expert",
    color: "bg-purple-100 text-purple-800",
  },
  {
    category: "Senior Consultant",
    criteria:
      "13+ years with at least 5 years in Level-12; OR from open market with Post Graduation and 13 years professional standing",
    remarks: "Senior level expert",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    category: "Consultant",
    criteria:
      "6-13 years of experience with Post Graduation / Engineering degree",
    remarks: "Mid-level expert",
    color: "bg-blue-100 text-blue-800",
  },
  {
    category: "Project Associate",
    criteria:
      "0-6 years of experience with Post Graduation / Engineering degree",
    remarks: "Entry to mid-level",
    color: "bg-teal-100 text-teal-800",
  },
  {
    category: "Young Professional",
    criteria:
      "Relevant professional degree from reputed institutions (ISI, IIT, DCS, IIM, etc.) with maximum age of 35 years",
    remarks: "For exceptional young talent",
    color: "bg-green-100 text-green-800",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Apply Through the Portal",
    desc: "Submit your application with complete details including qualifications, experience, domains of expertise, and preferred NPC offices.",
  },
  {
    step: 2,
    title: "Screening Committee Review",
    desc: "A committee of 3 DDGs + DD Admin reviews applications monthly. They verify completeness, validate eligibility criteria, and categorize by domain and level.",
  },
  {
    step: 3,
    title: "Mandatory Interview by Empanelment Committee",
    desc: "Consultant level and below: GH Domain + Directors + GH Admin. Senior Consultant: DDG + Directors + GH Admin. Advisor: DG, NPC + Directors + GH Admin.",
  },
  {
    step: 4,
    title: "Evaluation",
    desc: "Assessed on: Technical knowledge, Communication, Problem-solving, Understanding of NPC's work, and Relevant experience.",
  },
  {
    step: 5,
    title: "DG Approval",
    desc: "Final recommendation is sent to the Director General, NPC for approval.",
  },
  {
    step: 6,
    title: "Empanelment Letter Issued",
    desc: "Issued within 7 working days of DG approval. Valid for 3 years, subject to satisfactory performance and renewal.",
  },
];

const npcOffices = [
  "HQ New Delhi",
  "Bengaluru",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Gandhinagar",
  "Guwahati",
  "Hyderabad",
  "Jaipur",
  "Kanpur",
  "Kolkata",
  "Mumbai",
  "Patna",
];

export default function EmpanelmentGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-teal-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Empanelment Guide
          </h1>
          <p className="mt-3 max-w-2xl text-teal-100">
            Everything you need to know about empanelment at NPC — categories,
            eligibility, process, and what to expect (as per AI No. 859)
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* What is Empanelment */}
        <section>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <BookOpen className="h-6 w-6 text-teal-600" />
            What is Empanelment?
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-teal-600" />
          <div className="mt-4 rounded-lg border-l-4 border-teal-500 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-gray-700">
              NPC maintains a <strong>pre-qualified pool of empanelled experts</strong> who
              can be engaged on short notice as per project requirements.
              Empanelment enables NPC to quickly mobilize domain experts for
              consultancy projects, training programmes, and advisory roles
              across the country.
            </p>
          </div>
        </section>

        {/* Categories & Eligibility */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Users className="h-6 w-6 text-indigo-600" />
            Empanelment Categories &amp; Eligibility
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-indigo-600" />
          <p className="mt-3 text-sm text-gray-500">
            As per AI 859 Section 2.3
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-indigo-50">
                  <th className="px-4 py-3 font-semibold text-indigo-900">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold text-indigo-900">
                    Eligibility Criteria
                  </th>
                  <th className="px-4 py-3 font-semibold text-indigo-900">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligibility.map((row, i) => (
                  <tr
                    key={row.category}
                    className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${row.color}`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.criteria}</td>
                    <td className="px-4 py-3 text-gray-500 italic">
                      {row.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CheckCircle2 className="h-6 w-6 text-teal-600" />
            How Empanelment Works
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-teal-600" />

          <div className="mt-8 space-y-6">
            {processSteps.map((s) => (
              <div key={s.step} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                    {s.step}
                  </div>
                  {s.step < processSteps.length && (
                    <div className="mt-1 h-full w-0.5 bg-teal-200" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preferred NPC Offices */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <MapPin className="h-6 w-6 text-rose-600" />
            Preferred NPC Offices
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-rose-600" />
          <p className="mt-3 text-sm text-gray-500">
            You may select up to 3 preferred offices during your application.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {npcOffices.map((office) => (
              <span
                key={office}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
              >
                {office}
              </span>
            ))}
          </div>
        </section>

        {/* Remuneration note */}
        <section className="mt-14">
          <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-6">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
            <div>
              <h3 className="font-semibold text-teal-900">Remuneration</h3>
              <p className="mt-1 text-sm text-gray-700">
                Empanelled experts receive the same remuneration as per the
                engagement salary structure. For full details, see the{" "}
                <Link
                  href="/information/salary-structure"
                  className="font-medium text-teal-700 underline hover:text-teal-900"
                >
                  Salary Structure
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-lg bg-teal-50 p-8 text-center sm:flex-row sm:justify-center sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-teal-900">
              Ready to get empanelled?
            </h3>
            <p className="mt-1 text-sm text-teal-700">
              Start your empanelment application today.
            </p>
          </div>
          <Link
            href="/apply/empanelment"
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Apply for Empanelment
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/information"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Information Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
