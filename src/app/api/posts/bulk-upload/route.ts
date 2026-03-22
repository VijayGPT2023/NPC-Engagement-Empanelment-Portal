import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session || !["admin", "dg"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      return NextResponse.json({ error: "Only .xlsx or .xls files are accepted" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Excel file is empty" }, { status: 400 });
    }

    // Expected columns (case-insensitive matching):
    const COLUMN_MAP: Record<string, string> = {
      "advertisement no": "advertisementNo",
      "advertisement_no": "advertisementNo",
      "advno": "advertisementNo",
      "adv no": "advertisementNo",
      "title": "title",
      "post title": "title",
      "functional role": "functionalRole",
      "functional_role": "functionalRole",
      "role": "functionalRole",
      "domain": "domain",
      "engagement type": "engagementType",
      "engagement_type": "engagementType",
      "type": "engagementType",
      "number of positions": "numberOfPositions",
      "positions": "numberOfPositions",
      "no of positions": "numberOfPositions",
      "place of deployment": "placeOfDeployment",
      "deployment": "placeOfDeployment",
      "location": "placeOfDeployment",
      "office": "placeOfDeployment",
      "min qualification": "minQualification",
      "minimum qualification": "minQualification",
      "qualification": "minQualification",
      "min experience years": "minExperienceYears",
      "min experience": "minExperienceYears",
      "experience": "minExperienceYears",
      "experience years": "minExperienceYears",
      "max age": "maxAgeLimitYears",
      "max age limit": "maxAgeLimitYears",
      "age limit": "maxAgeLimitYears",
      "remuneration range": "remunerationRange",
      "remuneration": "remunerationRange",
      "contract period": "contractPeriod",
      "period": "contractPeriod",
      "eligibility criteria": "eligibilityCriteria",
      "eligibility": "eligibilityCriteria",
      "work responsibilities": "workResponsibilities",
      "responsibilities": "workResponsibilities",
      "terms and conditions": "termsAndConditions",
      "terms": "termsAndConditions",
      "application deadline": "applicationDeadline",
      "deadline": "applicationDeadline",
      "post code": "postCode",
      "post_code": "postCode",
      "group": "groupDivisionName",
      "group name": "groupDivisionName",
      "division": "groupDivisionName",
      "desired qualification": "desiredQualification",
      "preferred qualification": "desiredQualification",
      "professional certification": "professionalCertification",
      "certification": "professionalCertification",
      "experience description": "experienceDescription",
      "experience details": "experienceDescription",
      "preferred experience": "preferredExperience",
      "age relaxation": "ageRelaxation",
      "application instructions": "applicationInstructions",
      "instructions": "applicationInstructions",
      "annexure": "annexureFormRef",
      "form reference": "annexureFormRef",
    };

    // Normalize row keys
    function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = COLUMN_MAP[key.toLowerCase().trim()] || key;
        normalized[normalizedKey] = value;
      }
      return normalized;
    }

    const results: { row: number; advNo: string; status: "created" | "skipped" | "error"; message: string }[] = [];
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = normalizeRow(rows[i]);
      const rowNum = i + 2; // Excel row (1-indexed header + data)

      try {
        const advNo = String(raw.advertisementNo || "").trim();
        if (!advNo) {
          results.push({ row: rowNum, advNo: "", status: "error", message: "Advertisement No is required" });
          errors++;
          continue;
        }

        // Check duplicate
        const existing = await prisma.postRequirement.findUnique({
          where: { advertisementNo: advNo },
        });
        if (existing) {
          results.push({ row: rowNum, advNo, status: "skipped", message: "Already exists" });
          skipped++;
          continue;
        }

        const title = String(raw.title || "").trim();
        const functionalRole = String(raw.functionalRole || "consultant").trim().toLowerCase().replace(/\s+/g, "_");
        const domain = String(raw.domain || "").trim().toUpperCase();
        const engagementType = String(raw.engagementType || "full_time").trim().toLowerCase().replace(/\s+/g, "_");
        const numberOfPositions = parseInt(String(raw.numberOfPositions || "1"), 10) || 1;
        const placeOfDeployment = String(raw.placeOfDeployment || "HQ").trim().toUpperCase();
        const minQualification = String(raw.minQualification || "").trim();
        const minExperienceYears = parseInt(String(raw.minExperienceYears || "0"), 10) || 0;
        const maxAge = raw.maxAgeLimitYears ? parseInt(String(raw.maxAgeLimitYears), 10) : null;
        const remunerationRange = raw.remunerationRange ? String(raw.remunerationRange).trim() : null;
        const contractPeriod = raw.contractPeriod ? String(raw.contractPeriod).trim() : null;
        const eligibilityCriteria = String(raw.eligibilityCriteria || "As per advertisement").trim();
        const workResponsibilities = String(raw.workResponsibilities || "As per advertisement").trim();
        const termsAndConditions = String(raw.termsAndConditions || "Purely contractual engagement.").trim();

        // Parse deadline
        let applicationDeadline: Date;
        if (raw.applicationDeadline) {
          // Excel dates can be serial numbers or strings
          const deadlineVal = raw.applicationDeadline;
          if (typeof deadlineVal === "number") {
            // Excel serial date
            applicationDeadline = new Date((deadlineVal - 25569) * 86400 * 1000);
          } else {
            applicationDeadline = new Date(String(deadlineVal));
          }
        } else {
          // Default: 30 days from now
          applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        if (isNaN(applicationDeadline.getTime())) {
          applicationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }

        // Validate required fields
        if (!title) {
          results.push({ row: rowNum, advNo, status: "error", message: "Title is required" });
          errors++;
          continue;
        }

        // Extract optional new fields
        const postCode = raw.postCode ? String(raw.postCode).trim() : null;
        const groupDivisionName = raw.groupDivisionName ? String(raw.groupDivisionName).trim() : null;
        const desiredQualification = raw.desiredQualification ? String(raw.desiredQualification).trim() : null;
        const professionalCertification = raw.professionalCertification ? String(raw.professionalCertification).trim() : null;
        const experienceDescription = raw.experienceDescription ? String(raw.experienceDescription).trim() : null;
        const preferredExperience = raw.preferredExperience ? String(raw.preferredExperience).trim() : null;
        const ageRelaxation = raw.ageRelaxation ? String(raw.ageRelaxation).trim() : null;
        const applicationInstructions = raw.applicationInstructions ? String(raw.applicationInstructions).trim() : null;
        const annexureFormRef = raw.annexureFormRef ? String(raw.annexureFormRef).trim() : null;

        await prisma.postRequirement.create({
          data: {
            advertisementNo: advNo,
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
            maxAgeLimitYears: maxAge,
            ageRelaxation,
            remunerationRange,
            contractPeriod,
            eligibilityCriteria,
            workResponsibilities,
            termsAndConditions,
            applicationInstructions,
            annexureFormRef,
            applicationDeadline,
            createdBy: session.userId,
          },
        });

        results.push({ row: rowNum, advNo, status: "created", message: title });
        created++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ row: rowNum, advNo: String(raw.advertisementNo || ""), status: "error", message: msg.substring(0, 200) });
        errors++;
      }
    }

    return NextResponse.json({
      message: `Bulk upload complete: ${created} created, ${skipped} skipped, ${errors} errors`,
      summary: { total: rows.length, created, skipped, errors },
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
