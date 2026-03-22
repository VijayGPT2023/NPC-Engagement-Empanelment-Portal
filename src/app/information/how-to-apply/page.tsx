import Link from "next/link";
import {
  UserPlus,
  Search,
  FileEdit,
  Upload,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";

export const metadata = { title: "How to Apply - NPC Portal" };

const engagementSteps = [
  {
    num: 1,
    icon: UserPlus,
    title: "Register on the Portal",
    color: "bg-blue-500",
    items: [
      'Click "Register" on the homepage to create your account',
      "Complete the 5-step registration process",
      "Fill personal details, qualifications, and work experience",
      "Upload passport-size photo, Aadhaar card, and date of birth proof",
      "Your profile is saved permanently and reused for all future applications",
    ],
  },
  {
    num: 2,
    icon: Search,
    title: "Browse Current Openings",
    color: "bg-green-500",
    items: [
      'Visit the homepage and scroll to the "Current Openings" section',
      "Filter by domain, location, and designation",
      "Click on any post card to see the full details, eligibility, and remuneration",
    ],
  },
  {
    num: 3,
    icon: FileEdit,
    title: "Fill the Application Form",
    color: "bg-purple-500",
    items: [
      'Click the "Apply" button on any open post',
      "The form auto-fills from your saved profile (you can still edit)",
      "Sections: Select Post, Personal Details, Qualifications, Experience, Empanelment Opt-in, Declaration",
    ],
  },
  {
    num: 4,
    icon: Upload,
    title: "Upload Documents (Inline)",
    color: "bg-orange-500",
    items: [
      "Documents are uploaded alongside the relevant section of the form",
      "Qualification certificate is uploaded with qualification details",
      "Experience certificate is uploaded with experience details",
      "No separate document upload page is needed",
    ],
  },
  {
    num: 5,
    icon: CheckCircle2,
    title: "Review & Submit",
    color: "bg-teal-500",
    items: [
      "Review all entered data on the summary screen",
      "Accept the declaration checkbox",
      "Click Submit to finalize your application",
      'Track status from Dashboard \u2192 "My Applications"',
    ],
  },
];

const empanelmentExtra = [
  "Select category: Advisor / Senior Consultant / Consultant / Project Associate / Young Professional",
  "Select your domains of expertise and preferred NPC offices",
  "Provide service experience: training conducted, consultancy projects, research work",
];

const tips = [
  "Complete your profile fully before applying to any post",
  "Upload clear, readable scanned documents (PDF or JPG, max 5 MB each)",
  "Use your 12-digit Aadhaar number exactly as printed on the card",
  "Ensure qualification details match your certificates exactly",
  "For retired government personnel: keep PPO (Pension Payment Order) document ready",
  "You can save partial applications as drafts and resume later",
];

export default function HowToApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How to Apply
          </h1>
          <p className="mt-3 max-w-2xl text-blue-200">
            A complete step-by-step guide for applying to contractual
            engagements and empanelment at NPC
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Engagement Steps */}
        <h2 className="text-2xl font-bold text-gray-900">
          For Engagement Applications
        </h2>
        <div className="mx-auto mt-2 h-1 w-16 rounded bg-blue-600" />

        <div className="mt-10 space-y-8">
          {engagementSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="flex gap-5 rounded-lg bg-white p-6 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${step.color} text-white text-lg font-bold`}
                >
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Icon className="h-5 w-5 text-gray-500" />
                    {step.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {step.items.map((item, i) => (
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
              </div>
            );
          })}
        </div>

        {/* Empanelment Section */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900">
            For Empanelment Applications
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded bg-teal-600" />
          <p className="mt-4 text-sm text-gray-600">
            Empanelment follows a similar process as engagement applications,
            with these additional sections:
          </p>
          <div className="mt-4 rounded-lg border-l-4 border-teal-500 bg-white p-6 shadow-sm">
            <ul className="space-y-3">
              {empanelmentExtra.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Tips for Applicants
          </h2>
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-4 rounded-lg bg-blue-50 p-8 text-center sm:flex-row sm:justify-center sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Ready to apply?
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Browse current openings or register your profile to get started.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth/register"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
            >
              Register
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              View Openings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
