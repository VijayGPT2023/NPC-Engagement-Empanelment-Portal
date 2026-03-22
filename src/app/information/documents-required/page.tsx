import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info,
} from "lucide-react";

export const metadata = { title: "Documents Required - NPC Portal" };

const mandatoryDocs = [
  {
    num: 1,
    document: "Passport-size Photograph",
    details: "Recent, white background, face clearly visible",
    format: "JPG / PNG, max 2 MB",
  },
  {
    num: 2,
    document: "Aadhaar Card",
    details: "Self-attested copy (both sides)",
    format: "PDF / JPG, max 5 MB",
  },
  {
    num: 3,
    document: "Date of Birth Proof",
    details: "Birth certificate / 10th marksheet / passport",
    format: "PDF / JPG, max 5 MB",
  },
  {
    num: 4,
    document: "Educational Certificates",
    details:
      "Each qualification from 10th onward \u2014 marksheet + degree certificate",
    format: "PDF / JPG per certificate",
  },
  {
    num: 5,
    document: "Experience Certificates",
    details:
      "From each employer \u2014 mentioning period, designation, and duties performed",
    format: "PDF / JPG per certificate",
  },
  {
    num: 6,
    document: "Updated CV / Resume",
    details: "Signed, detailed, covering all experience and qualifications",
    format: "PDF, max 5 MB",
  },
];

const additionalDocs = [
  {
    num: 7,
    document: "PPO (Pension Payment Order)",
    when: "If retired from Government / PSU",
  },
  {
    num: 8,
    document: "Professional Certification",
    when: "If post requires specific certification (CA, Six Sigma, BEE, etc.)",
  },
  {
    num: 9,
    document: "Caste / Category Certificate",
    when: "For availing age relaxation (SC / ST / OBC / PwD)",
  },
  {
    num: 10,
    document: "No Objection Certificate (NOC)",
    when: "If currently employed in Government / PSU",
  },
  {
    num: 11,
    document: "Published Research Papers",
    when: "If relevant to the post applied for",
  },
];

const docTips = [
  "All documents must be self-attested",
  "Scans should be clear and readable (no blurry images)",
  "Maximum file size: 5 MB per document",
  "Accepted formats: PDF, JPG, JPEG, PNG",
  "Original documents will be verified at the time of joining",
];

export default function DocumentsRequiredPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-green-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Documents Required
          </h1>
          <p className="mt-3 max-w-2xl text-green-100">
            Complete checklist of documents you need to prepare before applying
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Mandatory Documents */}
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Mandatory Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            These documents are required for all applicants
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-green-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-green-900">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-green-900">
                    Document
                  </th>
                  <th className="px-4 py-3 font-semibold text-green-900">
                    Details
                  </th>
                  <th className="px-4 py-3 font-semibold text-green-900">
                    Format
                  </th>
                </tr>
              </thead>
              <tbody>
                {mandatoryDocs.map((doc, i) => (
                  <tr
                    key={doc.num}
                    className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {doc.num}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {doc.document}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.details}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {doc.format}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Documents */}
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-blue-600" />
            Additional Documents (If Applicable)
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Submit these only if they apply to your situation
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-blue-900">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold text-blue-900">
                    Document
                  </th>
                  <th className="px-4 py-3 font-semibold text-blue-900">
                    When Required
                  </th>
                </tr>
              </thead>
              <tbody>
                {additionalDocs.map((doc, i) => (
                  <tr
                    key={doc.num}
                    className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {doc.num}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {doc.document}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Tips */}
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Info className="h-6 w-6 text-amber-600" />
            Document Tips
          </h2>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
            <ul className="space-y-3">
              {docTips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/information"
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Information Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
