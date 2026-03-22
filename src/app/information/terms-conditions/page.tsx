import Link from "next/link";
import { ArrowLeft, Shield, AlertCircle, Scale, Clock } from "lucide-react";

export const metadata = { title: "General Terms & Conditions - NPC Portal" };

const generalConditions = [
  "The engagement shall be purely on a contract basis and will not confer any right for regular appointment in NPC or its associated organizations.",
  "The contractual person shall not be entitled to any benefits / compensation / absorption / regularization of service in NPC.",
  "The contractual person shall not claim any benefit under the Industrial Disputes Act, 1947 or Contract Labour (Regulation and Abolition) Act, 1970.",
  "The contractual person shall be governed as per applicable provisions of NPC for the assignment.",
  "In case of unsatisfactory performance, indiscipline, or failure to perform, NPC may terminate the contract at any time without notice and without assigning any reason.",
  "The contractual person shall produce original documents and certificates in support of age, qualification and experience at the time of joining, failing which the offer shall stand withdrawn.",
  "NPC reserves the right to cancel or withdraw the advertisement at any time without assigning any reason.",
  "Working hours, travelling and daily allowance, leave etc. shall be as per applicable provisions of NPC.",
];

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-red-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            General Terms &amp; Conditions
          </h1>
          <p className="mt-3 max-w-2xl text-red-100">
            Rules and conditions governing contractual engagement at the
            National Productivity Council (as per AI No. 858)
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* General Conditions */}
        <section>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Shield className="h-6 w-6 text-red-600" />
            General Conditions for All Engagements
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-red-600" />

          <div className="mt-6 space-y-4">
            {generalConditions.map((condition, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg bg-white p-5 shadow-sm"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-gray-700">
                  {condition}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Review */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Clock className="h-6 w-6 text-blue-600" />
            Performance Review
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-blue-600" />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border-t-4 border-blue-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Full-time</h3>
              <p className="mt-2 text-sm text-gray-600">
                Reviewed annually by Group Head / Regional Director. Remuneration
                may be increased as per the Annexure-II matrix after satisfactory
                performance.
              </p>
            </div>
            <div className="rounded-lg border-t-4 border-orange-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Lump Sum</h3>
              <p className="mt-2 text-sm text-gray-600">
                Reviewed quarterly by Group Head / Regional Director based on
                milestone delivery and output quality.
              </p>
            </div>
            <div className="rounded-lg border-t-4 border-green-500 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Leave</h3>
              <p className="mt-2 text-sm text-gray-600">
                12 days leave per year on pro-rata basis. No accumulation of
                leave beyond the calendar year is allowed.
              </p>
            </div>
          </div>
        </section>

        {/* Expenditure Limits */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Scale className="h-6 w-6 text-amber-600" />
            Expenditure Limits
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-amber-600" />

          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-semibold text-amber-900">
                Consultancy Projects
              </h3>
              <p className="mt-2 text-sm text-gray-700">
                Total expenditure on contractual persons in any consultancy project
                shall not be more than <strong>30%</strong> of the total project
                value at any point. If expenditure exceeds 30%, specific prior
                approval of the Director General, NPC is required.
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h3 className="font-semibold text-amber-900">
                Training Programmes
              </h3>
              <p className="mt-2 text-sm text-gray-700">
                Surplus generated (after all direct and attributable expenses
                including honorarium) should not be less than:
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 rounded-lg bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">35%</p>
                  <p className="mt-1 text-xs text-gray-500">
                    For Residential Programmes
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">55%</p>
                  <p className="mt-1 text-xs text-gray-500">
                    For Non-residential / Online Programmes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="mt-14">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
            <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Important Notice</h3>
              <p className="mt-1 text-sm text-gray-700">
                All applicants are advised to carefully read and understand these
                terms and conditions before applying. By submitting an application,
                you acknowledge that you have read, understood, and agree to abide
                by all the terms and conditions mentioned herein.
              </p>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/information"
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Information Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
