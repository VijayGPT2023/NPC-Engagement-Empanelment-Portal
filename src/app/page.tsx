"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useTranslation } from "@/i18n";

interface Post {
  id: string;
  title: string;
  domain: string;
  functionalRole: string;
  placeOfDeployment: string;
  applicationDeadline: string;
  numberOfPositions: number;
  desiredQualification?: string | null;
  professionalCertification?: string | null;
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

const stats = [
  { label: "NPC Offices", value: "13", sub: "HQ + 12 Regional" },
  { label: "Domains", value: "11+", sub: "IT, HRM, IE, ECA..." },
  { label: "Established", value: "1958", sub: "66+ Years of Service" },
  { label: "Under", value: "DPIIT", sub: "Ministry of Commerce" },
];

export default function HomePage() {
  const { t } = useTranslation();
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
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section role="banner" className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
          <div className="flex flex-col items-center text-center">
            {/* Logos */}
            <div className="mb-6 flex items-center gap-6">
              <div className="rounded-full bg-white p-2 shadow-md">
                <img src="/emblem_goi.png" alt="Government of India Emblem" className="h-14 w-auto sm:h-16" />
              </div>
              <div className="h-12 w-px bg-white/30" />
              <div className="rounded-full bg-white p-2 shadow-md">
                <img src="/npc_logo.png" alt="NPC Logo" className="h-14 w-auto sm:h-16" />
              </div>
            </div>

            <div className="mb-2 inline-block rounded-full bg-white/10 px-5 py-1.5 text-sm font-medium tracking-wide text-blue-100 backdrop-blur-sm">
              Government of India
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("common.orgName")}
            </h1>
            <p className="mt-2 text-base text-blue-200 sm:text-lg">
              Under DPIIT, Ministry of Commerce &amp; Industry, Government of India
            </p>
            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" />
            <h2 className="mt-5 text-xl font-semibold sm:text-2xl lg:text-3xl">
              {t("home.heroTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-blue-100/90">
              {t("home.heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply/engagement">
                <Button variant="primary" size="lg" className="bg-white !text-blue-900 hover:bg-blue-50 shadow-lg px-8">
                  Apply for Engagement
                </Button>
              </Link>
              <Link href="/apply/empanelment">
                <Button variant="primary" size="lg" className="bg-yellow-500 !text-blue-900 hover:bg-yellow-400 shadow-lg px-8 font-semibold">
                  Apply for Empanelment
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════ STATS BAR ═══════════════════════ */}
      <section className="relative z-10 mx-auto -mt-2 max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-4 text-center shadow-lg ring-1 ring-gray-100">
              <p className="text-2xl font-bold text-blue-800 sm:text-3xl">{s.value}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-500">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How It Works</h2>
          <p className="mt-2 text-gray-600">Simple 4-step process to apply</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", title: "Register", desc: "Create your account and complete your profile with qualifications, experience, and documents.", color: "from-blue-500 to-blue-600", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
            { step: "02", title: "Browse Openings", desc: "View active posts for contractual engagement or apply directly for empanelment.", color: "from-purple-500 to-purple-600", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
            { step: "03", title: "Apply Online", desc: "Fill the form (auto-filled from your profile), upload documents inline, and submit.", color: "from-green-500 to-green-600", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { step: "04", title: "Track Status", desc: "Monitor your application status, screening results, and communication from your dashboard.", color: "from-orange-500 to-orange-600", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
          ].map((item) => (
            <div key={item.step} className="group relative">
              <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-md`}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="absolute top-4 right-4 text-3xl font-black text-gray-300 group-hover:text-blue-300 transition-colors">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Connector line (desktop) */}
        <div className="mt-4 hidden lg:block">
          <div className="mx-auto h-0.5 w-3/4 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 to-orange-200 rounded-full" />
        </div>
      </section>

      {/* ═══════════════════════ CTA CARDS ═══════════════════════ */}
      <section aria-label="Application options" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Engagement */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white shadow-xl transition-transform hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">{t("home.engagementTitle")}</h3>
              <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
                {t("home.engagementDesc")}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-blue-100/80">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Full-time, Part-time &amp; Lump-sum positions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Apply against specific advertised posts
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Option to also apply for empanelment
                </li>
              </ul>
              <Link href="/apply/engagement">
                <Button variant="primary" size="lg" className="mt-6 w-full bg-white !text-blue-900 hover:bg-blue-50 shadow-md">
                  {t("home.engagementTitle")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Empanelment */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-8 text-white shadow-xl transition-transform hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">{t("home.empanelmentTitle")}</h3>
              <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
                {t("home.empanelmentDesc")}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-teal-100/80">
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Advisor, Consultant, Young Professional &amp; more
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Choose your preferred NPC office (13 locations)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Get engaged when suitable projects arise
                </li>
              </ul>
              <Link href="/apply/empanelment">
                <Button variant="primary" size="lg" className="mt-6 w-full bg-white !text-teal-900 hover:bg-teal-50 shadow-md">
                  {t("home.empanelmentTitle")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ INFO HUB ═══════════════════════ */}
      <section aria-label="Information Hub" className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Information &amp; Resources
          </h2>
          <p className="mt-2 text-gray-600">
            Everything you need to know before applying
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/information/how-to-apply", title: "How to Apply", desc: "Step-by-step guide", border: "border-blue-500", bg: "bg-blue-50", iconColor: "text-blue-600", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { href: "/information/salary-structure", title: "Salary Structure", desc: "Remuneration matrix", border: "border-purple-500", bg: "bg-purple-50", iconColor: "text-purple-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { href: "/information/documents-required", title: "Documents Required", desc: "Complete checklist", border: "border-green-500", bg: "bg-green-50", iconColor: "text-green-600", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { href: "/information/empanelment-guide", title: "Empanelment Guide", desc: "Categories & process", border: "border-teal-500", bg: "bg-teal-50", iconColor: "text-teal-600", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
          ].map((card) => (
            <Link key={card.href} href={card.href}>
              <div className={`group flex items-center gap-4 rounded-xl border-l-4 ${card.border} bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                  <svg className={`h-5 w-5 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700">{card.title}</p>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/information" className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline">
            View all information &amp; resources &rarr;
          </Link>
        </div>
      </section>

      {/* ═══════════════════════ CURRENT OPENINGS ═══════════════════════ */}
      <section role="navigation" aria-label="Current Openings" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.currentOpenings")}
            </h2>
            <p className="mt-2 text-gray-600">
              Browse active contractual positions at NPC
            </p>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
                <span className="ml-3 text-gray-500">{t("common.loading")}</span>
              </div>
            ) : posts.length === 0 ? (
              <Card className="mx-auto max-w-lg text-center">
                <p className="text-gray-500">
                  {t("home.noOpenings")}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-200"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-800">{post.domain}</span>
                      <span className="text-xs text-gray-400">{post.numberOfPositions} {post.numberOfPositions === 1 ? "position" : "positions"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                      {post.title}
                    </h3>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {post.functionalRole}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {post.placeOfDeployment}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-red-600 font-medium">
                          Deadline: {new Date(post.applicationDeadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </p>
                    </div>
                    <Link href="/apply/engagement">
                      <Button variant="primary" size="sm" className="mt-4 w-full">
                        {t("home.viewDetails")}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ABOUT NPC ═══════════════════════ */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {t("home.aboutNpc")}
              </h2>
              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
              <p className="mt-6 text-gray-600 leading-relaxed">
                {t("home.aboutNpcText")}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-2xl font-bold text-blue-800">11+</p>
                  <p className="text-sm text-gray-600">Service Domains</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-800">13</p>
                  <p className="text-sm text-gray-600">Offices Nationwide</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-800 p-8 text-white shadow-xl">
              <h3 className="text-lg font-bold">NPC Service Domains</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  "Information Technology", "Human Resources", "Industrial Engineering",
                  "Energy Management", "Environment & Climate", "Agri-Business",
                  "Economics", "Finance", "Administration",
                  "International Services", "Inspection",
                ].map((d) => (
                  <div key={d} className="flex items-center gap-2 text-sm text-blue-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ OFFICES MAP ═══════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("home.npcOffices")}
            </h2>
            <p className="mt-2 text-gray-600">
              Headquarters and 12 Regional Directorates across India
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {npcOffices.map((office, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-xl ${idx === 0 ? "bg-blue-800 text-white ring-2 ring-blue-300" : "bg-white ring-1 ring-gray-200"} px-4 py-3 shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${idx === 0 ? "bg-white/20" : "bg-blue-50"}`}>
                  <svg className={`h-4 w-4 ${idx === 0 ? "text-white" : "text-blue-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${idx === 0 ? "text-white" : "text-gray-900"}`}>
                    {office.city}
                  </p>
                  <p className={`text-xs ${idx === 0 ? "text-blue-200" : "text-gray-500"}`}>{office.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-blue-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-1.5">
                  <img src="/emblem_goi.png" alt="" className="h-8 w-auto" />
                </div>
                <div className="rounded-full bg-white p-1.5">
                  <img src="/npc_logo.png" alt="" className="h-8 w-auto" />
                </div>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">
                {t("common.orgName")}
              </h3>
              <p className="mt-1 text-sm text-blue-200">
                Under DPIIT, Ministry of Commerce &amp; Industry
                <br />
                Government of India
              </p>
              <address className="mt-4 text-sm not-italic text-blue-300">
                Utpadakta Bhawan, 5-6, Institutional Area
                <br />
                Lodhi Road, New Delhi - 110003
                <br />
                Phone: 011-24690331
              </address>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                {t("footer.quickLinks")}
              </h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/apply/engagement" className="hover:text-white transition-colors">{t("home.engagementTitle")}</Link></li>
                <li><Link href="/apply/empanelment" className="hover:text-white transition-colors">{t("home.empanelmentTitle")}</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">{t("common.login")}</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">{t("common.register")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Information</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/information/how-to-apply" className="hover:text-white transition-colors">How to Apply</Link></li>
                <li><Link href="/information/salary-structure" className="hover:text-white transition-colors">Salary Structure</Link></li>
                <li><Link href="/information/documents-required" className="hover:text-white transition-colors">Documents Required</Link></li>
                <li><Link href="/information/empanelment-guide" className="hover:text-white transition-colors">Empanelment Guide</Link></li>
                <li><Link href="/information/terms-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{t("footer.importantLinks")}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="https://www.npcindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.npcWebsite")}</a></li>
                <li><a href="https://dpiit.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.dpiitWebsite")}</a></li>
                <li><a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t("footer.indiaGov")}</a></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-blue-800/50 pt-6 text-center text-xs text-blue-400">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
