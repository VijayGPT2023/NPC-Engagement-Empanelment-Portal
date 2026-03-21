"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Post {
  id: string;
  title: string;
  domain: string;
  functionalRole: string;
  placeOfDeployment: string;
  applicationDeadline: string;
  numberOfPositions: number;
}

const npcOffices = [
  { name: "Headquarters", city: "New Delhi" },
  { name: "Regional Directorate", city: "Bengaluru" },
  { name: "Regional Directorate", city: "Bhubaneswar" },
  { name: "Regional Directorate", city: "Chandigarh" },
  { name: "Regional Directorate", city: "Chennai" },
  { name: "Regional Directorate", city: "Gandhinagar" },
  { name: "Regional Directorate", city: "Guwahati" },
  { name: "Regional Directorate", city: "Hyderabad" },
  { name: "Regional Directorate", city: "Jaipur" },
  { name: "Regional Directorate", city: "Kanpur" },
  { name: "Regional Directorate", city: "Kolkata" },
  { name: "Regional Directorate", city: "Mumbai" },
  { name: "Regional Directorate", city: "Patna" },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : data.posts ?? []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="text-center">
            <div className="mb-3 inline-block rounded bg-white/10 px-4 py-1 text-sm font-medium tracking-wide text-blue-100">
              Government of India
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              National Productivity Council
            </h1>
            <p className="mt-2 text-base text-blue-200 sm:text-lg">
              Under DPIIT, Ministry of Commerce &amp; Industry, Government of India
            </p>
            <div className="mx-auto mt-6 h-1 w-24 rounded bg-yellow-400" />
            <h2 className="mt-6 text-xl font-semibold sm:text-2xl lg:text-3xl">
              Contractual Engagement &amp; Empanelment Portal
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              A unified platform for professionals seeking contractual engagement
              and empanelment opportunities with the National Productivity
              Council.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="-mt-10 relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Apply for Engagement */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Apply for Engagement
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              For contractual positions against advertised posts. Browse current
              openings and apply for positions matching your qualifications and
              experience.
            </p>
            <Link href="/apply/engagement">
              <Button variant="primary" size="lg" className="mt-6 w-full">
                Apply for Engagement
              </Button>
            </Link>
          </div>

          {/* Apply for Empanelment */}
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Apply for Empanelment
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              For empanelment as an external expert or associate consultant.
              Register your expertise to be considered for NPC projects and
              consultancy assignments.
            </p>
            <Link href="/apply/empanelment">
              <Button variant="outline" size="lg" className="mt-6 w-full">
                Apply for Empanelment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Current Openings
          </h2>
          <p className="mt-2 text-gray-600">
            Browse active contractual positions at NPC
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
              <span className="ml-3 text-gray-500">Loading openings...</span>
            </div>
          ) : posts.length === 0 ? (
            <Card className="mx-auto max-w-lg text-center">
              <p className="text-gray-500">
                No active openings at the moment. Please check back later.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-700">Domain:</span>{" "}
                      {post.domain}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Designation:</span>{" "}
                      {post.functionalRole}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Location:</span>{" "}
                      {post.placeOfDeployment}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Positions:</span>{" "}
                      {post.numberOfPositions}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Deadline:</span>{" "}
                      <span className="text-red-600 font-medium">
                        {new Date(post.applicationDeadline).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                  <Link href="/apply/engagement">
                    <Button variant="primary" size="sm" className="mt-4 w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About NPC */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              About National Productivity Council
            </h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-blue-700" />
          </div>
          <div className="mx-auto mt-8 max-w-3xl text-center text-gray-600 leading-relaxed">
            <p>
              The National Productivity Council (NPC) is an autonomous body
              established in 1958 under the Department for Promotion of Industry
              and Internal Trade (DPIIT), Ministry of Commerce &amp; Industry,
              Government of India. NPC is a constituent of the Tokyo-based Asian
              Productivity Organization (APO), an intergovernmental body of which
              the Government of India is a founding member.
            </p>
            <p className="mt-4">
              NPC provides consultancy and training services to the Government,
              public and private sector organizations in areas including
              productivity, quality, energy management, environmental management,
              economic services, agribusiness, information technology, and human
              resources development.
            </p>
          </div>
        </div>
      </section>

      {/* NPC Offices */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              NPC Offices
            </h2>
            <p className="mt-2 text-gray-600">
              Headquarters and 12 Regional Directorates across India
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {npcOffices.map((office, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {office.city}
                  </p>
                  <p className="text-xs text-gray-500">{office.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                National Productivity Council
              </h3>
              <p className="mt-2 text-sm text-blue-200">
                Under DPIIT, Ministry of Commerce &amp; Industry
                <br />
                Government of India
              </p>
              <address className="mt-4 text-sm not-italic text-blue-200">
                Utpadakta Bhawan, 5-6, Institutional Area
                <br />
                Lodhi Road, New Delhi - 110003
                <br />
                Phone: 011-24690331
              </address>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/apply/engagement" className="hover:text-white transition-colors">
                    Apply for Engagement
                  </Link>
                </li>
                <li>
                  <Link href="/apply/empanelment" className="hover:text-white transition-colors">
                    Apply for Empanelment
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Important Links
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.npcindia.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    NPC Official Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://dpiit.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    DPIIT
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.india.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Government of India
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-blue-800 pt-6 text-center text-xs text-blue-300">
            &copy; {new Date().getFullYear()} National Productivity Council. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
