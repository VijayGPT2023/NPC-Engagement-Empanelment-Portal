import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// GET: Get post details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.postRequirement.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin" && session.role !== "dg") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify post exists
    const existing = await prisma.postRequirement.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title",
      "postCode",
      "functionalRole",
      "domain",
      "groupDivisionName",
      "engagementType",
      "numberOfPositions",
      "placeOfDeployment",
      "minQualification",
      "desiredQualification",
      "professionalCertification",
      "minExperienceYears",
      "experienceDescription",
      "preferredExperience",
      "maxAgeLimitYears",
      "ageRelaxation",
      "remunerationRange",
      "contractPeriod",
      "eligibilityCriteria",
      "workResponsibilities",
      "termsAndConditions",
      "applicationInstructions",
      "annexureFormRef",
      "applicationDeadline",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "applicationDeadline") {
          updateData[field] = new Date(body[field]);
        } else if (field === "minExperienceYears" || field === "maxAgeLimitYears" || field === "numberOfPositions") {
          updateData[field] = body[field] !== null ? parseInt(body[field], 10) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const post = await prisma.postRequirement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Close/cancel post (admin only) - soft delete by status change
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin" && session.role !== "dg") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.postRequirement.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Determine new status based on query param or default to cancelled
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "cancel";
    const newStatus = action === "close" ? "closed" : "cancelled";

    const post = await prisma.postRequirement.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({
      message: `Post ${newStatus} successfully`,
      post,
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
