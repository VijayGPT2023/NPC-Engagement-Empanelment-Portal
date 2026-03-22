import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { getCached, setCache, invalidateCache } from "@/lib/cache";

// GET: List all active posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";
    const domain = searchParams.get("domain");
    const engagementType = searchParams.get("engagementType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const cacheKey = `posts:${status}:${domain || "all"}:${engagementType || "all"}:${page}:${limit}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const where: Record<string, unknown> = { status };
    if (domain) where.domain = domain;
    if (engagementType) where.engagementType = engagementType;

    const [posts, total] = await Promise.all([
      prisma.postRequirement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.postRequirement.count({ where }),
    ]);

    const result = { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    await setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new post (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin" && session.role !== "dg") {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      advertisementNo,
      postCode,
      title,
      functionalRole,
      domain,
      groupDivisionName,
      engagementType,
      numberOfPositions,
      placeOfDeployment,
      minQualification,
      desiredQualification,
      professionalCertification,
      minExperienceYears,
      experienceDescription,
      preferredExperience,
      maxAgeLimitYears,
      ageRelaxation,
      remunerationRange,
      contractPeriod,
      eligibilityCriteria,
      workResponsibilities,
      termsAndConditions,
      applicationInstructions,
      annexureFormRef,
      applicationDeadline,
    } = body;

    // Validate required fields
    const requiredFields = [
      "advertisementNo",
      "title",
      "functionalRole",
      "domain",
      "engagementType",
      "placeOfDeployment",
      "minQualification",
      "minExperienceYears",
      "eligibilityCriteria",
      "workResponsibilities",
      "applicationDeadline",
    ];
    const missing = requiredFields.filter((f) => !body[f] && body[f] !== 0);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate deadline is in the future
    const deadline = new Date(applicationDeadline);
    if (isNaN(deadline.getTime()) || deadline <= new Date()) {
      return NextResponse.json(
        { error: "Application deadline must be a valid future date" },
        { status: 400 }
      );
    }

    const post = await prisma.postRequirement.create({
      data: {
        advertisementNo,
        postCode: postCode || null,
        title,
        functionalRole,
        domain,
        groupDivisionName: groupDivisionName || null,
        engagementType,
        numberOfPositions: numberOfPositions || 1,
        placeOfDeployment,
        minQualification,
        desiredQualification: desiredQualification || null,
        professionalCertification: professionalCertification || null,
        minExperienceYears: parseInt(minExperienceYears, 10),
        experienceDescription: experienceDescription || null,
        preferredExperience: preferredExperience || null,
        maxAgeLimitYears: maxAgeLimitYears ? parseInt(maxAgeLimitYears, 10) : null,
        ageRelaxation: ageRelaxation || null,
        remunerationRange: remunerationRange || null,
        contractPeriod: contractPeriod || null,
        eligibilityCriteria,
        workResponsibilities,
        termsAndConditions: termsAndConditions || "",
        applicationInstructions: applicationInstructions || null,
        annexureFormRef: annexureFormRef || null,
        applicationDeadline: deadline,
        createdBy: session.userId,
      },
    });

    await invalidateCache("posts:");

    return NextResponse.json(
      { message: "Post requirement created successfully", post },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create post error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Advertisement number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
