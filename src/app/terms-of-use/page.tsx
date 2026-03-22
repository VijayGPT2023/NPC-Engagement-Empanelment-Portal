import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use - NPC Contractual Engagement & Empanelment Portal",
  description:
    "Terms of Use for the National Productivity Council Contractual Engagement and Empanelment Portal.",
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Terms of Use
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
            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and
            use of the National Productivity Council (NPC) Contractual
            Engagement &amp; Empanelment Portal (&ldquo;Portal&rdquo;). By
            accessing or using this Portal, you agree to be bound by these
            Terms. If you do not agree to these Terms, you must not use the
            Portal.
          </p>

          {/* Section 1 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              1. Eligibility
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              The Portal is intended for use by individuals who meet the
              eligibility criteria specified for each contractual engagement
              position or empanelment category. By submitting an application,
              you confirm that:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                You are an Indian citizen or otherwise eligible to work in India
                as per applicable laws.
              </li>
              <li>
                You meet the minimum age, educational qualification, and
                experience requirements specified for the position or
                empanelment category.
              </li>
              <li>
                You are not debarred or disqualified from government engagement
                by any competent authority.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              2. Accuracy of Information
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              You are solely responsible for ensuring that all information
              submitted through the Portal is true, accurate, complete, and
              up-to-date. Any misrepresentation, falsification, or suppression
              of material facts in your application shall render your
              candidature liable to cancellation at any stage of the selection
              process. If discovered after engagement, it shall be grounds for
              immediate termination without notice.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              3. Document Verification
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              NPC reserves the right to verify all documents, certificates,
              qualifications, and claims made in your application. This
              verification may include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                Verification of educational qualifications directly with issuing
                institutions.
              </li>
              <li>
                Verification of previous employment and experience with former
                employers.
              </li>
              <li>
                Aadhaar-based identity verification through UIDAI services.
              </li>
              <li>
                Any other verification deemed necessary by the Selection
                Committee.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              You agree to cooperate fully with any verification process and to
              provide original documents for inspection when requested.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              4. Right to Reject Applications
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              NPC reserves the absolute right to reject any application at any
              stage of the selection process without assigning any reason. The
              decision of the Selection Committee and the Director General, NPC,
              shall be final and binding. NPC also reserves the right to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>
                Cancel or modify any advertised position or empanelment category
                at any time.
              </li>
              <li>
                Increase or decrease the number of positions without prior
                notice.
              </li>
              <li>
                Modify eligibility criteria, terms of engagement, or
                remuneration at its sole discretion.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              5. No Guarantee of Engagement
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Submission of an application through this Portal does not
              constitute a guarantee or assurance of contractual engagement or
              empanelment with NPC. The selection process is competitive and
              based on merit, as evaluated by duly constituted Selection
              Committees. Registration on the Portal or empanelment in the
              database does not confer any right to engagement or assignment.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              6. Intellectual Property
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              All work product, reports, deliverables, data, research findings,
              and other materials produced by contractually engaged personnel or
              empanelled consultants during the course of their engagement with
              NPC shall be the sole and exclusive intellectual property of the
              National Productivity Council. This includes, but is not limited
              to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
              <li>Reports, studies, and research papers.</li>
              <li>Software, tools, and digital assets developed for NPC.</li>
              <li>Training materials and presentations.</li>
              <li>
                Any derivative works or improvements made using NPC resources.
              </li>
            </ul>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Engaged personnel shall not use, publish, or share any NPC work
              product without prior written authorization from the competent
              authority.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              7. Governing Law and Jurisdiction
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of India. Any disputes arising out of or in connection
              with these Terms, the use of this Portal, or any engagement with
              NPC shall be subject to the exclusive jurisdiction of the courts
              situated in New Delhi, India.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              8. Modification of Terms
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              NPC reserves the right to modify, amend, or update these Terms at
              any time without prior notice. The revised Terms shall be
              effective immediately upon publication on this Portal. It is your
              responsibility to review these Terms periodically. Continued use
              of the Portal after any modifications constitutes your acceptance
              of the revised Terms.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              9. Contact Information
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              For any queries or concerns regarding these Terms of Use, please
              contact:
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
