import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - NPC Contractual Engagement & Empanelment Portal",
  description:
    "Privacy Policy for the National Productivity Council Contractual Engagement and Empanelment Portal.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-blue-200">
              National Productivity Council — Contractual Engagement &amp;
              Empanelment Portal
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm text-gray-500">
            Last updated: 19 March 2026
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            The National Productivity Council (NPC), an autonomous body under
            the Department for Promotion of Industry and Internal Trade (DPIIT),
            Ministry of Commerce &amp; Industry, Government of India, is
            committed to protecting the privacy and personal data of all users
            of this Contractual Engagement &amp; Empanelment Portal
            (&ldquo;Portal&rdquo;). This Privacy Policy explains how we
            collect, use, store, and protect your information.
          </p>

          {/* Section 1 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              1. Data Collection
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              In the course of processing your application for contractual
              engagement or empanelment, the Portal may collect the following
              categories of personal information:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Personal identification information:</strong> Full name,
                date of birth, gender, photograph, father&rsquo;s/mother&rsquo;s
                name, marital status, and contact details (address, email,
                mobile number).
              </li>
              <li>
                <strong>Aadhaar information:</strong> Aadhaar number for
                identity verification purposes as per government requirements.
              </li>
              <li>
                <strong>Educational qualifications:</strong> Degrees,
                certifications, institutions attended, year of passing, and
                marks/grades.
              </li>
              <li>
                <strong>Professional experience:</strong> Employment history,
                designations, organizations worked with, and areas of expertise.
              </li>
              <li>
                <strong>Documents:</strong> Scanned copies of certificates,
                mark sheets, experience letters, identity documents, and other
                supporting documents as required for verification.
              </li>
              <li>
                <strong>Financial information:</strong> PAN number and bank
                account details (required only upon selection for engagement).
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              2. Purpose of Data Collection
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Your personal data is collected solely for the following
              purposes:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                Processing and evaluating applications for contractual
                engagement positions and empanelment as external experts or
                associate consultants.
              </li>
              <li>
                Verifying identity, qualifications, and professional experience
                of applicants.
              </li>
              <li>
                Communicating with applicants regarding the status of their
                applications.
              </li>
              <li>
                Maintaining a database of empanelled professionals for future
                NPC projects and consultancy assignments.
              </li>
              <li>
                Fulfilling statutory and regulatory obligations of NPC as a
                government body.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              3. Data Storage and Security
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              NPC takes the security of your personal data seriously and has
              implemented appropriate technical and organizational measures:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                All data is encrypted both in transit (using TLS/SSL) and at
                rest using industry-standard encryption algorithms.
              </li>
              <li>
                The Portal and its databases are hosted on secure government
                infrastructure compliant with Government of India Information
                Security guidelines.
              </li>
              <li>
                Access to personal data is restricted to authorized NPC
                personnel on a need-to-know basis, with role-based access
                controls.
              </li>
              <li>
                Regular security audits and vulnerability assessments are
                conducted to ensure data protection.
              </li>
              <li>
                All uploaded documents are stored in secure, access-controlled
                cloud storage with audit logging.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              4. Data Sharing
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Your personal data may be shared only within the following
              government entities for official purposes:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                National Productivity Council (NPC) headquarters and regional
                directorates.
              </li>
              <li>
                Department for Promotion of Industry and Internal Trade (DPIIT),
                Ministry of Commerce &amp; Industry.
              </li>
              <li>
                Ministry of Electronics and Information Technology (MeitY) for
                technical infrastructure purposes.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              <strong>
                Your data will not be shared with any third parties, private
                entities, or commercial organizations.
              </strong>{" "}
              Data may be disclosed only if required by law or by order of a
              competent court or statutory authority.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              5. Your Rights
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              In accordance with the Digital Personal Data Protection (DPDP)
              Act, 2023, you have the following rights regarding your personal
              data:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Right to Access:</strong> You may request access to the
                personal data we hold about you.
              </li>
              <li>
                <strong>Right to Correction:</strong> You may request correction
                of inaccurate or incomplete personal data.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You may request deletion of
                your personal data, subject to legal and contractual retention
                requirements.
              </li>
              <li>
                <strong>Right to Grievance Redressal:</strong> You may raise
                grievances regarding data processing with NPC&rsquo;s designated
                Data Protection Officer.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              To exercise any of these rights, please contact us using the
              details provided in Section 8 below.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              6. Data Retention
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Your personal data will be retained for a period of{" "}
              <strong>five (5) years</strong> after the completion or
              termination of your contractual engagement or empanelment with
              NPC. For applicants who are not selected, data will be retained
              for five (5) years from the date of application to allow for
              consideration in future engagements. After the retention period,
              data will be securely deleted or anonymized in accordance with
              government data management policies.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              7. Legal Compliance
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              This Portal and its data processing practices comply with the
              following legislation:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                <strong>Information Technology Act, 2000</strong> and its
                associated rules, including the Information Technology
                (Reasonable Security Practices and Procedures and Sensitive
                Personal Data or Information) Rules, 2011.
              </li>
              <li>
                <strong>Aadhaar (Targeted Delivery of Financial and Other
                Subsidies, Benefits and Services) Act, 2016</strong> for
                Aadhaar-based identity verification.
              </li>
              <li>
                <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>{" "}
                for the processing and protection of digital personal data.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              8. Contact Information
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              For any queries, concerns, or requests regarding this Privacy
              Policy or the handling of your personal data, please contact:
            </p>
            <address className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700 not-italic">
              <strong>National Productivity Council</strong>
              <br />
              Utpadakta Bhawan, 5-6, Institutional Area
              <br />
              Lodhi Road, New Delhi &ndash; 110003
              <br />
              Phone: 011-24690331
              <br />
              Website:{" "}
              <a
                href="https://www.npcindia.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                www.npcindia.gov.in
              </a>
            </address>
          </section>

          {/* Back link */}
          <div className="mt-12 border-t border-gray-200 pt-6">
            <Link
              href="/"
              className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
