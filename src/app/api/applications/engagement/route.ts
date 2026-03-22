import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Generate application number like NPC/ENG/2026/0001
async function generateEngagementAppNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NPC/ENG/${year}/`;

  const lastApp = await prisma.engagementApplication.findFirst({
    where: { applicationNo: { startsWith: prefix } },
    orderBy: { applicationNo: "desc" },
    select: { applicationNo: true },
  });

  let seq = 1;
  if (lastApp) {
    const lastSeq = parseInt(lastApp.applicationNo.split("/").pop() || "0", 10);
    seq = lastSeq + 1;
  }

  return `${prefix}${seq.toString().padStart(4, "0")}`;
}

// GET: List applications (admin sees all, applicant sees own)
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own applications
    if (session.role === "applicant") {
      where.userId = session.userId;
    }

    if (status) where.status = status;
    if (postId) where.postRequirementId = postId;

    const [applications, total] = await Promise.all([
      prisma.engagementApplication.findMany({
        where,
        include: {
          postRequirement: {
            select: {
              id: true,
              title: true,
              advertisementNo: true,
              functionalRole: true,
              domain: true,
            },
          },
          qualifications: true,
          experiences: true,
          documents: true,
          screeningReviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              qualifications: true,
              experiences: true,
              documents: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.engagementApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get engagement applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Submit new engagement application
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { success } = checkRateLimit(`submit-engagement:${ip}`, RATE_LIMITS.submit);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "postRequirementId",
      "title",
      "fullName",
      "fatherMotherSpouseName",
      "dateOfBirth",
      "gender",
      "aadhaarNo",
      "contactNo",
      "emailId",
      "permanentAddress",
      "correspondenceAddress",
      "postAppliedFor",
    ];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate post requirement exists and is active
    const post = await prisma.postRequirement.findUnique({
      where: { id: body.postRequirementId },
    });
    if (!post) {
      return NextResponse.json(
        { error: "Post requirement not found" },
        { status: 404 }
      );
    }
    if (post.status !== "active") {
      return NextResponse.json(
        { error: "This post requirement is no longer accepting applications" },
        { status: 400 }
      );
    }
    if (new Date(post.applicationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Application deadline has passed" },
        { status: 400 }
      );
    }

    // Check for duplicate application
    const existingApp = await prisma.engagementApplication.findFirst({
      where: {
        userId: session.userId,
        postRequirementId: body.postRequirementId,
      },
    });
    if (existingApp) {
      return NextResponse.json(
        { error: "You have already applied for this post" },
        { status: 409 }
      );
    }

    // Generate application number
    const applicationNo = await generateEngagementAppNo();

    // Create the application with nested qualifications, experiences
    const application = await prisma.engagementApplication.create({
      data: {
        applicationNo,
        userId: session.userId,
        postRequirementId: body.postRequirementId,
        title: body.title,
        fullName: body.fullName,
        fatherMotherSpouseName: body.fatherMotherSpouseName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationality: body.nationality || "Indian",
        aadhaarNo: body.aadhaarNo,
        contactNo: body.contactNo,
        alternateContactNo: body.alternateContactNo || null,
        emailId: body.emailId,
        permanentAddress: body.permanentAddress,
        correspondenceAddress: body.correspondenceAddress,
        postAppliedFor: body.postAppliedFor,
        isRetiredPerson: body.isRetiredPerson || false,
        retirementDate: body.retirementDate ? new Date(body.retirementDate) : null,
        lastOrganization: body.lastOrganization || null,
        lastDesignation: body.lastDesignation || null,
        ppoNumber: body.ppoNumber || null,
        alsoApplyEmpanelment: body.alsoApplyEmpanelment || false,
        declarationAccepted: body.declarationAccepted || false,
        declarationDate: body.declarationAccepted ? new Date() : null,
        qualifications: body.qualifications
          ? {
              create: body.qualifications.map(
                (q: {
                  degree: string;
                  discipline: string;
                  collegeName: string;
                  universityInstitution: string;
                  yearOfPassing: number;
                  marksPercentage?: number;
                  cgpa?: number;
                  isHighestQualification?: boolean;
                }) => ({
                  degree: q.degree,
                  discipline: q.discipline,
                  collegeName: q.collegeName,
                  universityInstitution: q.universityInstitution,
                  yearOfPassing: q.yearOfPassing,
                  marksPercentage: q.marksPercentage || null,
                  cgpa: q.cgpa || null,
                  isHighestQualification: q.isHighestQualification || false,
                })
              ),
            }
          : undefined,
        experiences: body.experiences
          ? {
              create: body.experiences.map(
                (e: {
                  organizationName: string;
                  designation: string;
                  startDate: string;
                  endDate?: string;
                  isCurrent?: boolean;
                  remunerationPayBand?: string;
                  dutiesDescription: string;
                  sectorType: string;
                }) => ({
                  organizationName: e.organizationName,
                  designation: e.designation,
                  startDate: new Date(e.startDate),
                  endDate: e.endDate ? new Date(e.endDate) : null,
                  isCurrent: e.isCurrent || false,
                  remunerationPayBand: e.remunerationPayBand || null,
                  dutiesDescription: e.dutiesDescription,
                  sectorType: e.sectorType,
                })
              ),
            }
          : undefined,
      },
      include: {
        qualifications: true,
        experiences: true,
        postRequirement: {
          select: { title: true, advertisementNo: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Engagement application submitted successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create engagement application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
