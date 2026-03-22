import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || (session.role !== "admin" && session.role !== "dg")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = "admin:stats";
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ── Post counts ──────────────────────────────────────────────
    const [totalPosts, activePosts, closedPosts] = await Promise.all([
      prisma.postRequirement.count(),
      prisma.postRequirement.count({ where: { status: "active" } }),
      prisma.postRequirement.count({ where: { status: "closed" } }),
    ]);

    // ── Engagement application counts by status ──────────────────
    const engagementGrouped = await prisma.engagementApplication.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const engagementCounts: Record<string, number> = {};
    let engagementTotal = 0;
    for (const g of engagementGrouped) {
      engagementCounts[g.status] = g._count.id;
      engagementTotal += g._count.id;
    }

    // ── Empanelment application counts by status ─────────────────
    const empanelmentGrouped = await prisma.empanelmentApplication.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const empanelmentCounts: Record<string, number> = {};
    let empanelmentTotal = 0;
    for (const g of empanelmentGrouped) {
      empanelmentCounts[g.status] = g._count.id;
      empanelmentTotal += g._count.id;
    }

    // ── Post-wise breakdown ──────────────────────────────────────
    const posts = await prisma.postRequirement.findMany({
      orderBy: { applicationDeadline: "asc" },
      select: {
        id: true,
        advertisementNo: true,
        title: true,
        domain: true,
        placeOfDeployment: true,
        applicationDeadline: true,
        status: true,
      },
    });

    const postIds = posts.map((p) => p.id);

    const postWiseGrouped = await prisma.engagementApplication.groupBy({
      by: ["postRequirementId", "status"],
      where: { postRequirementId: { in: postIds } },
      _count: { id: true },
    });

    // Build a map: postId -> { status -> count }
    const postCountMap: Record<string, Record<string, number>> = {};
    for (const g of postWiseGrouped) {
      if (!postCountMap[g.postRequirementId]) {
        postCountMap[g.postRequirementId] = {};
      }
      postCountMap[g.postRequirementId][g.status] = g._count.id;
    }

    const postWise = posts.map((p) => {
      const counts = postCountMap[p.id] || {};
      const total = Object.values(counts).reduce((s, v) => s + v, 0);
      return {
        id: p.id,
        advertisementNo: p.advertisementNo,
        title: p.title,
        domain: p.domain,
        placeOfDeployment: p.placeOfDeployment,
        applicationDeadline: p.applicationDeadline,
        status: p.status,
        applicationCounts: {
          total,
          submitted: counts["submitted"] || 0,
          under_screening: counts["under_screening"] || 0,
          shortlisted: counts["shortlisted"] || 0,
          selected: counts["selected"] || 0,
          rejected: counts["rejected"] || 0,
        },
      };
    });

    // ── Recent activity (last 20 updated applications) ───────────
    const recentEngagement = await prisma.engagementApplication.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        applicationNo: true,
        status: true,
        fullName: true,
        autoScreenScore: true,
        updatedAt: true,
        submittedAt: true,
        postRequirement: { select: { title: true } },
      },
    });

    const recentEmpanelment = await prisma.empanelmentApplication.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        applicationNo: true,
        status: true,
        fullName: true,
        autoScreenScore: true,
        updatedAt: true,
        submittedAt: true,
        categoryApplied: true,
      },
    });

    // Merge and sort by timestamp desc, keep top 20
    type ActivityItem = {
      type: string;
      message: string;
      timestamp: Date;
    };

    const activities: ActivityItem[] = [];

    for (const app of recentEngagement) {
      let type = "application_received";
      let message = `New application ${app.applicationNo} received for ${app.postRequirement.title}`;

      if (app.status === "under_screening") {
        type = "application_screened";
        const scoreStr = app.autoScreenScore != null ? ` - Score: ${app.autoScreenScore}%` : "";
        message = `Application ${app.applicationNo} screened${scoreStr}`;
      } else if (app.status === "shortlisted") {
        type = "application_shortlisted";
        message = `Application ${app.applicationNo} shortlisted`;
      } else if (app.status === "selected") {
        type = "application_selected";
        message = `Application ${app.applicationNo} selected`;
      } else if (app.status === "rejected") {
        type = "application_rejected";
        message = `Application ${app.applicationNo} rejected`;
      }

      activities.push({ type, message, timestamp: app.updatedAt });
    }

    for (const app of recentEmpanelment) {
      let type = "empanelment_received";
      let message = `New empanelment application ${app.applicationNo} received (${app.categoryApplied})`;

      if (app.status === "under_screening") {
        type = "empanelment_screened";
        const scoreStr = app.autoScreenScore != null ? ` - Score: ${app.autoScreenScore}%` : "";
        message = `Empanelment ${app.applicationNo} screened${scoreStr}`;
      } else if (app.status === "shortlisted") {
        type = "empanelment_shortlisted";
        message = `Empanelment ${app.applicationNo} shortlisted`;
      } else if (app.status === "empanelled") {
        type = "empanelment_empanelled";
        message = `${app.applicationNo} empanelled`;
      } else if (app.status === "rejected") {
        type = "empanelment_rejected";
        message = `Empanelment ${app.applicationNo} rejected`;
      }

      activities.push({ type, message, timestamp: app.updatedAt });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActivity = activities.slice(0, 20).map((a) => ({
      type: a.type,
      message: a.message,
      timestamp: a.timestamp.toISOString(),
    }));

    // ── Empanelment applications list (for tracking table) ───────
    const empanelmentApplications_list = await prisma.empanelmentApplication.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        applicationNo: true,
        fullName: true,
        categoryApplied: true,
        domains: true,
        status: true,
        autoScreenScore: true,
      },
    });

    const statsResult = {
      posts: {
        total: totalPosts,
        active: activePosts,
        closed: closedPosts,
      },
      engagementApplications: {
        total: engagementTotal,
        submitted: engagementCounts["submitted"] || 0,
        under_screening: engagementCounts["under_screening"] || 0,
        shortlisted: engagementCounts["shortlisted"] || 0,
        selected: engagementCounts["selected"] || 0,
        rejected: engagementCounts["rejected"] || 0,
      },
      empanelmentApplications: {
        total: empanelmentTotal,
        submitted: empanelmentCounts["submitted"] || 0,
        under_screening: empanelmentCounts["under_screening"] || 0,
        shortlisted: empanelmentCounts["shortlisted"] || 0,
        empanelled: empanelmentCounts["empanelled"] || 0,
      },
      postWise,
      recentActivity,
      empanelmentList: empanelmentApplications_list,
    };

    await setCache(cacheKey, statsResult, 2 * 60 * 1000); // 2 minutes TTL
    return NextResponse.json(statsResult);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
