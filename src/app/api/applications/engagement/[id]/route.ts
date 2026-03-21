import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Return full application with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const application = await prisma.engagementApplication.findUnique({
      where: { id },
      include: {
        postRequirement: true,
        qualifications: true,
        experiences: true,
        documents: true,
        screeningReviews: {
          orderBy: { reviewedAt: "desc" },
          include: {
            reviewer: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Non-admin users can only view their own applications
    if (
      session.role === "applicant" &&
      application.userId !== session.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Get single engagement application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update application status, add screening remarks
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin, screening_committee, and dg can update
    const allowedRoles = ["admin", "screening_committee", "dg"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json(
        { error: "Forbidden. Only admin, screening committee, or DG can update application status." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "submitted",
      "under_screening",
      "shortlisted",
      "selected",
      "rejected",
      "offered",
      "accepted",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify application exists
    const existing = await prisma.engagementApplication.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    const application = await prisma.engagementApplication.update({
      where: { id },
      data: { status },
    });

    // Create a screening review record for audit trail
    if (remarks || status !== existing.status) {
      await prisma.screeningReview.create({
        data: {
          reviewerId: session.userId,
          applicationId: id,
          applicationType: "engagement",
          decision: status,
          remarks: remarks || `Status changed to ${status}`,
          reviewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update engagement application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
