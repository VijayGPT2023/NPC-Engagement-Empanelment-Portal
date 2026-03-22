import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session || !["admin", "dg", "screening_committee"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("type") || "engagement_applications";
  const postId = searchParams.get("postId");

  try {
    let csv = "";
    let filename = "";

    switch (reportType) {
      case "engagement_applications": {
        const where: Record<string, unknown> = {};
        if (postId) where.postRequirementId = postId;

        const apps = await prisma.engagementApplication.findMany({
          where,
          include: {
            postRequirement: { select: { title: true, advertisementNo: true } },
            qualifications: true,
            experiences: true,
          },
          orderBy: { submittedAt: "desc" },
        });

        csv = "S.No,Application No,Adv No,Post Title,Name,Email,Gender,DOB,Contact,Qualification,Total Exp (Years),Status,Score,Screen Result,Submitted At\n";

        apps.forEach((app, i) => {
          const highestQual = app.qualifications.find(q => q.isHighestQualification) || app.qualifications[0];
          const totalExp = app.experiences.reduce((sum, exp) => {
            const start = new Date(exp.startDate).getTime();
            const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
            return sum + (end - start) / (365.25 * 24 * 60 * 60 * 1000);
          }, 0);

          csv += `${i + 1},"${app.applicationNo}","${app.postRequirement.advertisementNo}","${escapeCsv(app.postRequirement.title)}","${escapeCsv(app.fullName)}","${app.emailId}","${app.gender}","${app.dateOfBirth.toISOString().split("T")[0]}","${app.contactNo}","${highestQual?.degree || "N/A"}","${totalExp.toFixed(1)}","${app.status}","${app.autoScreenScore ?? "N/A"}","${app.autoScreenResult ?? "N/A"}","${app.submittedAt.toISOString().split("T")[0]}"\n`;
        });

        filename = postId ? `engagement_applications_${postId}.csv` : "engagement_applications_all.csv";
        break;
      }

      case "empanelment_applications": {
        const apps = await prisma.empanelmentApplication.findMany({
          include: { qualifications: true, experiences: true },
          orderBy: { submittedAt: "desc" },
        });

        csv = "S.No,Application No,Name,Email,Gender,Category,Service Type,Domains,Preferred Office,Status,Score,Submitted At\n";

        apps.forEach((app, i) => {
          csv += `${i + 1},"${app.applicationNo}","${escapeCsv(app.fullName)}","${app.emailId}","${app.gender}","${app.categoryApplied}","${app.serviceType}","${app.domains}","${app.preferredOffice1}","${app.status}","${app.autoScreenScore ?? "N/A"}","${app.submittedAt.toISOString().split("T")[0]}"\n`;
        });

        filename = "empanelment_applications_all.csv";
        break;
      }

      case "post_summary": {
        const posts = await prisma.postRequirement.findMany({
          include: { _count: { select: { applications: true } } },
          orderBy: { createdAt: "desc" },
        });

        csv = "S.No,Adv No,Title,Domain,Role,Type,Positions,Place,Deadline,Status,Applications\n";

        posts.forEach((post, i) => {
          csv += `${i + 1},"${post.advertisementNo}","${escapeCsv(post.title)}","${post.domain}","${post.functionalRole}","${post.engagementType}","${post.numberOfPositions}","${post.placeOfDeployment}","${post.applicationDeadline.toISOString().split("T")[0]}","${post.status}","${post._count.applications}"\n`;
        });

        filename = "post_summary.csv";
        break;
      }

      case "audit_log": {
        const reviews = await prisma.screeningReview.findMany({
          include: {
            reviewer: { select: { name: true, email: true } },
          },
          orderBy: { reviewedAt: "desc" },
          take: 1000,
        });

        csv = "S.No,Date,Reviewer,Reviewer Email,Application Type,Application ID,Decision,Remarks\n";

        reviews.forEach((review, i) => {
          csv += `${i + 1},"${review.reviewedAt.toISOString()}","${escapeCsv(review.reviewer.name)}","${review.reviewer.email}","${review.applicationType}","${review.applicationId || review.empanelmentApplicationId || "N/A"}","${review.decision}","${escapeCsv(review.remarks || "")}"\n`;
        });

        filename = "audit_log.csv";
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  return value.replace(/"/g, '""');
}
