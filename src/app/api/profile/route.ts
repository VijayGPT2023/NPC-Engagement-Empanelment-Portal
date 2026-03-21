import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// ─── GET /api/profile ─────────────────────────────────────────
// Returns the logged-in user's profile with qualifications, experiences, and document paths.

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
      include: {
        qualifications: true,
        experiences: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── PUT /api/profile ─────────────────────────────────────────
// Upsert user profile with nested qualifications and experiences (replace strategy).

export async function PUT(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title,
      fullName,
      fatherMotherSpouseName,
      dateOfBirth,
      gender,
      nationality,
      aadhaarNo,
      contactNo,
      alternateContactNo,
      permanentAddress,
      correspondenceAddress,
      photoPath,
      cvPath,
      aadhaarDocPath,
      dobProofPath,
      isRetiredPerson,
      retirementDate,
      lastOrganization,
      lastDesignation,
      ppoNumber,
      ppoDocPath,
      qualifications,
      experiences,
    } = body;

    // Determine completeness: all mandatory fields filled + at least 1 qualification
    const isComplete =
      !!title &&
      !!fullName &&
      !!dateOfBirth &&
      !!gender &&
      !!aadhaarNo &&
      !!contactNo &&
      !!permanentAddress &&
      Array.isArray(qualifications) &&
      qualifications.length >= 1;

    // Build profile data (shared between create and update)
    const profileData = {
      title,
      fullName,
      fatherMotherSpouseName: fatherMotherSpouseName || "",
      dateOfBirth: new Date(dateOfBirth),
      gender,
      nationality: nationality || "Indian",
      aadhaarNo,
      contactNo,
      alternateContactNo: alternateContactNo || null,
      permanentAddress,
      correspondenceAddress: correspondenceAddress || "",
      photoPath: photoPath || null,
      cvPath: cvPath || null,
      aadhaarDocPath: aadhaarDocPath || null,
      dobProofPath: dobProofPath || null,
      isRetiredPerson: !!isRetiredPerson,
      retirementDate: retirementDate ? new Date(retirementDate) : null,
      lastOrganization: lastOrganization || null,
      lastDesignation: lastDesignation || null,
      ppoNumber: ppoNumber || null,
      ppoDocPath: ppoDocPath || null,
      isComplete,
    };

    // Use a transaction to upsert profile and replace nested records
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Upsert the profile
      const profile = await tx.userProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          ...profileData,
        },
        update: profileData,
      });

      // Replace qualifications: delete existing, then recreate
      await tx.profileQualification.deleteMany({
        where: { profileId: profile.id },
      });

      if (Array.isArray(qualifications) && qualifications.length > 0) {
        await tx.profileQualification.createMany({
          data: qualifications.map(
            (q: {
              degree: string;
              discipline: string;
              collegeName: string;
              universityInstitution: string;
              yearOfPassing: number;
              marksPercentage?: number;
              cgpa?: number;
              isHighestQualification: boolean;
              certificatePath?: string;
            }) => ({
              profileId: profile.id,
              degree: q.degree,
              discipline: q.discipline,
              collegeName: q.collegeName,
              universityInstitution: q.universityInstitution,
              yearOfPassing: Number(q.yearOfPassing),
              marksPercentage: q.marksPercentage
                ? Number(q.marksPercentage)
                : null,
              cgpa: q.cgpa ? Number(q.cgpa) : null,
              isHighestQualification: !!q.isHighestQualification,
              certificatePath: q.certificatePath || null,
            })
          ),
        });
      }

      // Replace experiences: delete existing, then recreate
      await tx.profileExperience.deleteMany({
        where: { profileId: profile.id },
      });

      if (Array.isArray(experiences) && experiences.length > 0) {
        await tx.profileExperience.createMany({
          data: experiences.map(
            (e: {
              organizationName: string;
              designation: string;
              startDate: string;
              endDate?: string;
              isCurrent: boolean;
              remunerationPayBand?: string;
              dutiesDescription: string;
              sectorType: string;
              certificatePath?: string;
            }) => ({
              profileId: profile.id,
              organizationName: e.organizationName,
              designation: e.designation,
              startDate: new Date(e.startDate),
              endDate: e.endDate ? new Date(e.endDate) : null,
              isCurrent: !!e.isCurrent,
              remunerationPayBand: e.remunerationPayBand || null,
              dutiesDescription: e.dutiesDescription,
              sectorType: e.sectorType,
              certificatePath: e.certificatePath || null,
            })
          ),
        });
      }

      // Return the complete profile with nested data
      return tx.userProfile.findUnique({
        where: { id: profile.id },
        include: {
          qualifications: true,
          experiences: true,
        },
      });
    });

    return NextResponse.json({
      message: "Profile saved successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
