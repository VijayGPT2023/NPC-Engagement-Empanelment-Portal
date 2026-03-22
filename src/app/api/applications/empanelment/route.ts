import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Generate application number like NPC/EMP/2026/0001
async function generateEmpanelmentAppNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NPC/EMP/${year}/`;

  const lastApp = await prisma.empanelmentApplication.findFirst({
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

// GET: List empanelment applications
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryApplied = searchParams.get("categoryApplied");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own applications
    if (session.role === "applicant") {
      where.userId = session.userId;
    }

    if (status) where.status = status;
    if (categoryApplied) where.categoryApplied = categoryApplied;

    const [applications, total] = await Promise.all([
      prisma.empanelmentApplication.findMany({
        where,
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
        orderBy: { submittedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.empanelmentApplication.count({ where }),
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
    console.error("Get empanelment applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Submit new empanelment application
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { success } = checkRateLimit(`submit-empanelment:${ip}`, RATE_LIMITS.submit);
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
      "title",
      "fullName",
      "dateOfBirth",
      "gender",
      "contactNo",
      "emailId",
      "personalAddress",
      "categoryApplied",
      "serviceType",
      "domains",
      "areasOfExpertise",
      "preferredOffice1",
    ];
    const missing = requiredFields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      "Advisor",
      "Senior Consultant",
      "Consultant",
      "Project Associate",
      "Young Professional",
    ];
    if (!validCategories.includes(body.categoryApplied)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate service type
    const validServiceTypes = ["consultancy", "training", "both"];
    if (!validServiceTypes.includes(body.serviceType)) {
      return NextResponse.json(
        { error: `Invalid service type. Allowed: ${validServiceTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate application number
    const applicationNo = await generateEmpanelmentAppNo();

    const application = await prisma.empanelmentApplication.create({
      data: {
        applicationNo,
        userId: session.userId,
        title: body.title,
        fullName: body.fullName,
        fatherMotherSpouseName: body.fatherMotherSpouseName || null,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationality: body.nationality || "Indian",
        aadhaarNo: body.aadhaarNo || null,
        contactNo: body.contactNo,
        alternateContactNo: body.alternateContactNo || null,
        emailId: body.emailId,
        personalAddress: body.personalAddress,
        categoryApplied: body.categoryApplied,
        serviceType: body.serviceType,
        domains: body.domains,
        areasOfExpertise: body.areasOfExpertise,
        preferredOffice1: body.preferredOffice1,
        preferredOffice2: body.preferredOffice2 || null,
        preferredOffice3: body.preferredOffice3 || null,
        willingToWorkAnywhere: body.willingToWorkAnywhere || false,
        declarationAccepted: body.declarationAccepted || false,
        declarationDate: body.declarationAccepted ? new Date() : null,

        // Nested creates for related records
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
                  groupAService?: boolean;
                }) => ({
                  degree: q.degree,
                  discipline: q.discipline,
                  collegeName: q.collegeName,
                  universityInstitution: q.universityInstitution,
                  yearOfPassing: q.yearOfPassing,
                  marksPercentage: q.marksPercentage || null,
                  cgpa: q.cgpa || null,
                  isHighestQualification: q.isHighestQualification || false,
                  groupAService: q.groupAService || false,
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
                  dutiesDescription: string;
                  sectorType: string;
                }) => ({
                  organizationName: e.organizationName,
                  designation: e.designation,
                  startDate: new Date(e.startDate),
                  endDate: e.endDate ? new Date(e.endDate) : null,
                  isCurrent: e.isCurrent || false,
                  dutiesDescription: e.dutiesDescription,
                  sectorType: e.sectorType,
                })
              ),
            }
          : undefined,

        trainingsConducted: body.trainingsConducted
          ? {
              create: body.trainingsConducted.map(
                (t: {
                  trainingTitle: string;
                  clientOrganization: string;
                  clientType: string;
                  trainingMode: string;
                  startDate: string;
                  endDate: string;
                  numberOfParticipants?: number;
                }) => ({
                  trainingTitle: t.trainingTitle,
                  clientOrganization: t.clientOrganization,
                  clientType: t.clientType,
                  trainingMode: t.trainingMode,
                  startDate: new Date(t.startDate),
                  endDate: new Date(t.endDate),
                  numberOfParticipants: t.numberOfParticipants || null,
                })
              ),
            }
          : undefined,

        consultancyProjects: body.consultancyProjects
          ? {
              create: body.consultancyProjects.map(
                (c: {
                  projectTitle: string;
                  clientOrganization: string;
                  clientType: string;
                  startDate: string;
                  endDate?: string;
                  projectDescription: string;
                }) => ({
                  projectTitle: c.projectTitle,
                  clientOrganization: c.clientOrganization,
                  clientType: c.clientType,
                  startDate: new Date(c.startDate),
                  endDate: c.endDate ? new Date(c.endDate) : null,
                  projectDescription: c.projectDescription,
                })
              ),
            }
          : undefined,

        actionResearchProjects: body.actionResearchProjects
          ? {
              create: body.actionResearchProjects.map(
                (a: {
                  projectTitle: string;
                  clientOrganization: string;
                  clientType: string;
                  startDate: string;
                  endDate?: string;
                  projectDescription: string;
                }) => ({
                  projectTitle: a.projectTitle,
                  clientOrganization: a.clientOrganization,
                  clientType: a.clientType,
                  startDate: new Date(a.startDate),
                  endDate: a.endDate ? new Date(a.endDate) : null,
                  projectDescription: a.projectDescription,
                })
              ),
            }
          : undefined,

        certifications: body.certifications
          ? {
              create: body.certifications.map(
                (c: {
                  certificationName: string;
                  issuingOrganization: string;
                  dateObtained: string;
                  validTill?: string;
                }) => ({
                  certificationName: c.certificationName,
                  issuingOrganization: c.issuingOrganization,
                  dateObtained: new Date(c.dateObtained),
                  validTill: c.validTill ? new Date(c.validTill) : null,
                })
              ),
            }
          : undefined,

        professionalMemberships: body.professionalMemberships
          ? {
              create: body.professionalMemberships.map(
                (m: {
                  institutionName: string;
                  membershipType: string;
                  fromDate: string;
                  toDate?: string;
                }) => ({
                  institutionName: m.institutionName,
                  membershipType: m.membershipType,
                  fromDate: new Date(m.fromDate),
                  toDate: m.toDate ? new Date(m.toDate) : null,
                })
              ),
            }
          : undefined,
      },
      include: {
        qualifications: true,
        experiences: true,
        trainingsConducted: true,
        consultancyProjects: true,
        actionResearchProjects: true,
        certifications: true,
        professionalMemberships: true,
      },
    });

    return NextResponse.json(
      {
        message: "Empanelment application submitted successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create empanelment application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
