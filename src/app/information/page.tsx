import Link from "next/link";
import {
  FileText,
  IndianRupee,
  ClipboardList,
  HelpCircle,
  Shield,
  BookOpen,
} from "lucide-react";

export const metadata = { title: "Information Hub - NPC Portal" };

const sections = [
  {
    href: "/information/how-to-apply",
    icon: HelpCircle,
    title: "How to Apply",
    desc: "Step-by-step guide to fill the application form",
    color: "border-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    href: "/information/documents-required",
    icon: ClipboardList,
    title: "Documents Required",
    desc: "Checklist of documents needed for application",
    color: "border-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  {
    href: "/information/salary-structure",
    icon: IndianRupee,
    title: "Salary Structure",
    desc: "Remuneration matrix for all designation tiers",
    color: "border-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  {
    href: "/information/engagement-types",
    icon: FileText,
    title: "Types of Engagement",
    desc: "Full-time, Part-time, Lump Sum, Revenue Sharing & Resource Person",
    color: "border-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    href: "/information/terms-conditions",
    icon: Shield,
    title: "General Terms & Conditions",
    desc: "Rules governing contractual engagement at NPC",
    color: "border-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  {
    href: "/information/empanelment-guide",
    icon: BookOpen,
    title: "Empanelment Guide",
    desc: "How empanelment works — categories, eligibility, process",
    color: "border-teal-500",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
];

export default function InformationHub() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Information Hub
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-blue-200">
              Everything you need to know about contractual engagements and
              empanelment at the National Productivity Council
            </p>
            <div className="mx-auto mt-4 h-1 w-20 rounded bg-yellow-400" />
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href} className="group">
                <div
                  className={`flex h-full flex-col rounded-lg border-l-4 ${s.color} bg-white p-6 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg`}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${s.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${s.text}`} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {s.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-gray-600">{s.desc}</p>
                  <span
                    className={`mt-4 inline-flex items-center text-sm font-medium ${s.text} group-hover:underline`}
                  >
                    Read more
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Back to Home */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>
      </section>
    </div>
  );
}
