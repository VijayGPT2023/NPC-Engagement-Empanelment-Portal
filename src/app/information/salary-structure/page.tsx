import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";

export const metadata = { title: "Salary & Remuneration Structure - NPC Portal" };

export default function SalaryStructurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Link
            href="/information"
            className="mb-4 inline-flex items-center gap-1 text-sm text-purple-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Information Hub
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Salary &amp; Remuneration Structure
          </h1>
          <p className="mt-3 max-w-2xl text-purple-200">
            Detailed remuneration matrix for all contractual engagement
            designations as per Administrative Instruction No. 858
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-16">
        {/* Annexure II-A */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Annexure II-A: Full-time / Part-time Remuneration
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-purple-600" />
          <p className="mt-3 text-sm text-gray-500">
            Monthly consolidated remuneration (in Rs.) based on years of
            relevant experience after acquiring minimum qualification
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-200 bg-purple-50">
                  <th className="whitespace-nowrap px-3 py-3 font-semibold text-purple-900">
                    Sl.
                  </th>
                  <th className="px-3 py-3 font-semibold text-purple-900">
                    Designation
                  </th>
                  <th className="px-3 py-3 font-semibold text-purple-900">
                    Min Qualification
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    0 yrs
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    1 yr
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    2 yrs
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    3 yrs
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    4 yrs
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-purple-900">
                    5 yrs
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">1</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Support Executive
                  </td>
                  <td className="px-3 py-3 text-gray-600">Class XII pass</td>
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-center text-xs italic text-gray-500"
                  >
                    As per minimum wages, preferably from Manpower Agency
                  </td>
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-700">2</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Office Executive / Data Entry Operator / Accounts Executive
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Graduate degree in any discipline from recognized
                    university/institution with knowledge of working on computer
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    25,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    28,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    35,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    42,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    48,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    55,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">3</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Technical Executive
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    ITI in relevant trade (NCVT/SCVT) OR Diploma in relevant
                    Engineering discipline from recognized institution
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    25,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    28,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    35,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    42,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    48,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    55,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-700">4</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Legal Executive
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Degree in Law from a government recognized university
                  </td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                  <td className="px-3 py-3 text-center text-gray-400">-</td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">5</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Project Executive / Research Executive
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Graduate degree in relevant discipline from recognized
                    university/institution
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    28,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    35,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    44,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    50,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    57,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    65,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-700">6</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Senior Professional
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    (i) Post-graduation in relevant discipline from govt
                    recognized university/institution (ii) Graduate with
                    Intermediate in CA/ICWA (iii) MBA in any discipline
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    34,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    40,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    48,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    55,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    62,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    70,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">7</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Young Professional
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Professional degree from reputed institute (ISI, IIT, DCE,
                    IIM etc.) having 0-1 years experience. Max age 35 years. Max
                    tenure 3 years.
                  </td>
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-center font-semibold text-purple-700"
                  >
                    Rs. 60,000 (Fixed)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Annexure II-B */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Annexure II-B: Senior Level Remuneration
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-indigo-600" />

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-200 bg-indigo-50">
                  <th className="whitespace-nowrap px-3 py-3 font-semibold text-indigo-900">
                    Sl.
                  </th>
                  <th className="px-3 py-3 font-semibold text-indigo-900">
                    Designation
                  </th>
                  <th className="px-3 py-3 font-semibold text-indigo-900">
                    Min Qualification
                  </th>
                  <th className="px-3 py-3 font-semibold text-indigo-900">
                    Experience
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-indigo-900">
                    Monthly (Rs.)
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-indigo-900">
                    Daily (Rs.)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">8</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Consultant
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Graduate in any discipline from govt recognized
                    university/institution relevant to work
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    6 years and above (Max age 65)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900">
                    75,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    5,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td rowSpan={2} className="px-3 py-3 font-medium text-gray-700">
                    9
                  </td>
                  <td rowSpan={2} className="px-3 py-3 font-medium text-gray-900">
                    Senior Consultant
                  </td>
                  <td rowSpan={2} className="px-3 py-3 text-gray-600">
                    Same as above
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    10 years and above (Max age 65)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900">
                    90,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    6,000
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-3 py-3 text-gray-600">
                    15 years and above
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900">
                    1,10,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    8,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">10</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Advisor
                  </td>
                  <td className="px-3 py-3 text-gray-600">Same as above</td>
                  <td className="px-3 py-3 text-gray-600">
                    20 years and above
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900">
                    1,25,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    10,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-700">11</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Senior Advisor
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Retired from GoI from Secretary Level OR Doctorate from govt
                    recognized university
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    More than 20 years
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900">
                    1,50,000
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                    12,000
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700">12</td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Expert
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    Any Retired Person from Government / CPSE / Autonomous /
                    Statutory Body
                  </td>
                  <td className="px-3 py-3 text-gray-600">NA</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-600">
                    50% of (last Basic Pay + current DA at time of fixation)
                  </td>
                  <td className="px-3 py-3 text-center text-gray-400">NA</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Daily basis engagement is subject to a maximum of 15 days/month and
              not more than 90 days in a year.
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Candidates scoring more than 80% in evaluation shall be granted the
              maximum amount. Between 60%-80% shall be granted 90% of the maximum.
            </div>
          </div>
        </section>

        {/* Lump Sum */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Lump Sum Basis Remuneration
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-orange-600" />

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-orange-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-orange-900">
                    Sl.
                  </th>
                  <th className="px-4 py-3 font-semibold text-orange-900">
                    Value of Project / Assignment
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-orange-900">
                    Maximum Lump Sum (% of Project Value)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">1</td>
                  <td className="px-4 py-3 text-gray-900">
                    Up to Rs. 25 lakh
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-700">
                    20%
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">2</td>
                  <td className="px-4 py-3 text-gray-900">
                    More than Rs. 25 lakh and up to Rs. 100 lakh
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-700">
                    15%
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">3</td>
                  <td className="px-4 py-3 text-gray-900">
                    More than Rs. 100 lakh
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-700">
                    10%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Revenue Sharing */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue Sharing Basis
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-teal-600" />
          <div className="mt-4 rounded-lg border-l-4 border-teal-500 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">
              For reputed domain experts with minimum 15 years of relevant experience.
              Remuneration is linked to the value and successful delivery of the engagement.
              Details are shared with shortlisted candidates during the selection process.
            </p>
          </div>
        </section>

        {/* Resource Person */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Resource Person Honorarium
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-green-600" />

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-green-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-green-900">
                    Sl.
                  </th>
                  <th className="px-4 py-3 font-semibold text-green-900">
                    Level
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-green-900">
                    Traditional Areas (per session up to 90 min)
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-green-900">
                    Innovative Areas
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">1</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    Resource Person
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 4,500
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 6,000
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">2</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    Senior Resource Person
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 6,500
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 8,000
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">3</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    Eminent Resource Person
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 9,000
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    Rs. 12,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            If engaged for a full day (4 sessions minimum), the honorarium will
            not be more than 2.5 times the above per-session rate.
          </div>
        </section>

        {/* TA/DA Mapping */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            TA/DA Mapping (Annexure III)
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-blue-600" />

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-blue-900">
                    Sl.
                  </th>
                  <th className="px-4 py-3 font-semibold text-blue-900">
                    NPC Contractual Category
                  </th>
                  <th className="px-4 py-3 font-semibold text-blue-900">
                    Mapped Govt Pay Level (7th CPC)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">1</td>
                  <td className="px-4 py-3 text-gray-900">
                    Support Executive / Office Executive / Technical Executive /
                    Accounts Executive / Legal Executive
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    Level-8
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">2</td>
                  <td className="px-4 py-3 text-gray-900">
                    Project Executive, Research Executive, Senior Professional,
                    and other Senior Executive-level posts, Resource Person,
                    Consultant
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    Level-11
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">3</td>
                  <td className="px-4 py-3 text-gray-900">
                    Senior Consultant / Advisor / Sr. Resource Person / Eminent
                    Resource Person
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    Level-13
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance Hike */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Performance-Based Remuneration Hike (Annexure IV)
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-amber-600" />

          <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-amber-50">
                  <th className="px-4 py-3 font-semibold text-amber-900">
                    Average Performance Score (APS)
                  </th>
                  <th className="px-4 py-3 font-semibold text-amber-900">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-amber-900">
                    Remuneration Hike (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-900">4.50 - 5.00</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      Excellent
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    100% DA of last year
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">4.00 - 4.49</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                      Very Good
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    90% DA of last year
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-900">3.50 - 3.99</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                      Good
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    80% DA of last year
                  </td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">3.00 - 3.49</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      Average
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    70% DA of last year
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              Performance Evaluation Criteria:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Practical Knowledge",
                "Ability to Adapt",
                "Initiative",
                "Productivity",
                "Teamwork",
                "Adherence to NPC Regulations",
                "Work Quality",
                "Meeting Timelines",
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Leave Entitlement */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            Leave Entitlement
          </h2>
          <div className="mt-1 h-1 w-16 rounded bg-rose-600" />
          <div className="mt-4 rounded-lg border-l-4 border-rose-500 bg-white p-6 shadow-sm">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                12 days leave in a year on pro-rata basis
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                Accumulation of leave beyond the calendar year is not allowed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                Contractual personnel may be called beyond office hours including
                holidays for official work (no extra remuneration)
              </li>
            </ul>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/information"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Information Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
