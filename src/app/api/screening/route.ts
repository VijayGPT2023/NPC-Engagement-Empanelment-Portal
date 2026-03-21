import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { runScreening } from "@/lib/screening-engine";

// POST: Run auto-screening on an application
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin, screening_committee, or dg can trigger screening
    const allowedRoles = ["admin", "screening_committee", "dg"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden: insufficient permissions to run screening" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, type } = body;

    if (!applicationId || !type) {
      return NextResponse.json(
        { error: "applicationId and type are required" },
        { status: 400 }
      );
    }

    if (type !== "engagement" && type !== "empanelment") {
      return NextResponse.json(
        { error: "type must be 'engagement' or 'empanelment'" },
        { status: 400 }
      );
    }

    // Verify the application exists
    if (type === "engagement") {
      const app = await prisma.engagementApplication.findUnique({
        where: { id: applicationId },
        include: {
          postRequirement: true,
          qualifications: true,
          experiences: true,
          documents: true,
        },
      });

      if (!app) {
        return NextResponse.json(
          { error: "Engagement application not found" },
          { status: 404 }
        );
      }

      // Run the screening engine
      const screeningResult = await runScreening(app, type);

      // Update the application with screening results
      const updatedApp = await prisma.engagementApplication.update({
        where: { id: applicationId },
        data: {
          autoScreenScore: screeningResult.score,
          autoScreenResult: screeningResult.result,
          autoScreenDetails: JSON.stringify(screeningResult.details),
          status: "under_screening",
        },
      });

      return NextResponse.json({
        message: "Screening completed successfully",
        screening: {
          applicationId: updatedApp.id,
          applicationNo: updatedApp.applicationNo,
          score: screeningResult.score,
          result: screeningResult.result,
          details: screeningResult.details,
        },
      });
    } else {
      // Empanelment screening
      const app = await prisma.empanelmentApplication.findUnique({
        where: { id: applicationId },
        include: {
          qualifications: true,
          experiences: true,
          trainingsConducted: true,
          consultancyProjects: true,
          actionResearchProjects: true,
          certifications: true,
          professionalMemberships: true,
          documents: true,
        },
      });

      if (!app) {
        return NextResponse.json(
          { error: "Empanelment application not found" },
          { status: 404 }
        );
      }

      // Run the screening engine
      const screeningResult = await runScreening(app, type);

      // Update the application with screening results
      const updatedApp = await prisma.empanelmentApplication.update({
        where: { id: applicationId },
        data: {
          autoScreenScore: screeningResult.score,
          autoScreenResult: screeningResult.result,
          autoScreenDetails: JSON.stringify(screeningResult.details),
          status: "under_screening",
        },
      });

      return NextResponse.json({
        message: "Screening completed successfully",
        screening: {
          applicationId: updatedApp.id,
          applicationNo: updatedApp.applicationNo,
          score: screeningResult.score,
          result: screeningResult.result,
          details: screeningResult.details,
        },
      });
    }
  } catch (error) {
    console.error("Screening error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Get screening results for an application
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const type = searchParams.get("type");

    if (!applicationId || !type) {
      return NextResponse.json(
        { error: "applicationId and type query parameters are required" },
        { status: 400 }
      );
    }

    if (type === "engagement") {
      const app = await prisma.engagementApplication.findUnique({
        where: { id: applicationId },
        select: {
          id: true,
          applicationNo: true,
          fullName: true,
          status: true,
          autoScreenScore: true,
          autoScreenResult: true,
          autoScreenDetails: true,
          screeningReviews: {
            include: {
              reviewer: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { reviewedAt: "desc" },
          },
        },
      });

      if (!app) {
        return NextResponse.json(
          { error: "Engagement application not found" },
          { status: 404 }
        );
      }

      // Applicants can only view their own screening results
      if (session.role === "applicant") {
        const fullApp = await prisma.engagementApplication.findUnique({
          where: { id: applicationId },
          select: { userId: true },
        });
        if (fullApp?.userId !== session.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      return NextResponse.json({
        screening: {
          ...app,
          autoScreenDetails: app.autoScreenDetails
            ? JSON.parse(app.autoScreenDetails)
            : null,
        },
      });
    } else if (type === "empanelment") {
      const app = await prisma.empanelmentApplication.findUnique({
        where: { id: applicationId },
        select: {
          id: true,
          applicationNo: true,
          fullName: true,
          status: true,
          autoScreenScore: true,
          autoScreenResult: true,
          autoScreenDetails: true,
          screeningReviews: {
            include: {
              reviewer: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { reviewedAt: "desc" },
          },
        },
      });

      if (!app) {
        return NextResponse.json(
          { error: "Empanelment application not found" },
          { status: 404 }
        );
      }

      // Applicants can only view their own screening results
      if (session.role === "applicant") {
        const fullApp = await prisma.empanelmentApplication.findUnique({
          where: { id: applicationId },
          select: { userId: true },
        });
        if (fullApp?.userId !== session.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      return NextResponse.json({
        screening: {
          ...app,
          autoScreenDetails: app.autoScreenDetails
            ? JSON.parse(app.autoScreenDetails)
            : null,
        },
      });
    } else {
      return NextResponse.json(
        { error: "type must be 'engagement' or 'empanelment'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Get screening results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
