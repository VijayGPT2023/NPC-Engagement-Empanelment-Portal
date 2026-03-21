// ─── AUTO-SCREENING ENGINE FOR NPC APPLICATIONS ─────────────────
// Implements screening logic per AI 858 (Engagement) and AI 859 (Empanelment)

import { QUALIFICATION_LEVELS } from "./constants";

// ─── TYPES ──────────────────────────────────────────────────────

interface QualificationEntry {
  degree: string;
  discipline: string;
  collegeName: string;
  universityInstitution: string;
  yearOfPassing: number;
  marksPercentage: number | null;
  cgpa: number | null;
  isHighestQualification: boolean;
}

interface EmpanelmentQualificationEntry extends QualificationEntry {
  groupAService: boolean;
}

interface ExperienceEntry {
  organizationName: string;
  designation: string;
  startDate: Date | string;
  endDate: Date | string | null;
  isCurrent: boolean;
  dutiesDescription: string;
  sectorType: string; // government | public | private
}

interface PostRequirement {
  id: string;
  title: string;
  functionalRole: string;
  domain: string;
  engagementType: string;
  minQualification: string;
  minExperienceYears: number;
  maxAgeLimitYears: number | null;
  remunerationRange: string | null;
}

interface EngagementApplicationData {
  id: string;
  applicationNo: string;
  fullName: string;
  dateOfBirth: Date | string;
  isRetiredPerson: boolean;
  ppoNumber: string | null;
  postAppliedFor: string;
  postRequirement: PostRequirement;
  qualifications: QualificationEntry[];
  experiences: ExperienceEntry[];
}

interface ConsultancyProjectEntry {
  projectTitle: string;
  clientOrganization: string;
  clientType: string; // government_public | private
  startDate: Date | string;
  endDate: Date | string | null;
  projectDescription: string;
}

interface TrainingConductedEntry {
  trainingTitle: string;
  clientOrganization: string;
  clientType: string;
  startDate: Date | string;
  endDate: Date | string;
}

interface EmpanelmentApplicationData {
  id: string;
  applicationNo: string;
  fullName: string;
  dateOfBirth: Date | string;
  categoryApplied: string;
  serviceType: string;
  domains: string;
  areasOfExpertise: string;
  qualifications: EmpanelmentQualificationEntry[];
  experiences: ExperienceEntry[];
  trainingsConducted?: TrainingConductedEntry[];
  consultancyProjects?: ConsultancyProjectEntry[];
  actionResearchProjects?: ConsultancyProjectEntry[];
  certifications?: { certificationName: string; issuingOrganization: string }[];
  professionalMemberships?: { institutionName: string; membershipType: string }[];
}

// ─── SCREENING RESULT TYPES ────────────────────────────────────

interface EngagementScreeningDetails {
  qualificationMatch: {
    met: boolean;
    candidateLevel: number;
    requiredLevel: number;
    candidateHighestDegree: string;
    requiredQualification: string;
    remarks: string;
  };
  experienceMatch: {
    met: boolean;
    candidateTotalYears: number;
    requiredYears: number;
    remarks: string;
  };
  ageMatch: {
    met: boolean;
    candidateAge: number;
    maxAge: number | null;
    remarks: string;
  };
  retiredPersonCheck: {
    applicable: boolean;
    ppoProvided: boolean;
    remarks: string;
  };
  remunerationBand: {
    percentageOfMax: number;
    highestMarks: number | null;
    remarks: string;
  };
  overallResult: "eligible" | "not_eligible" | "needs_review";
  remarks: string[];
}

export interface EngagementScreeningResult {
  eligible: boolean;
  score: number;
  result: "eligible" | "not_eligible" | "needs_review";
  details: EngagementScreeningDetails;
}

interface EmpanelmentScreeningDetails {
  qualificationMatch: {
    met: boolean;
    candidateLevel: number;
    requiredLevel: number;
    candidateHighestDegree: string;
    requiredQualification: string;
    remarks: string;
  };
  experienceMatch: {
    met: boolean;
    candidateTotalYears: number;
    requiredMinYears: number;
    requiredMaxYears: number | null;
    remarks: string;
  };
  ageMatch: {
    met: boolean;
    candidateAge: number;
    maxAge: number;
    remarks: string;
  };
  groupAServiceCheck: {
    applicable: boolean;
    totalGroupAYears: number;
    met: boolean;
    remarks: string;
  };
  governmentAssignments: {
    count: number;
    preferred: number;
    met: boolean;
    remarks: string;
  };
  domainExpertise: {
    domainsApplied: string[];
    relevantExperienceFound: boolean;
    remarks: string;
  };
  overallResult: "eligible" | "not_eligible" | "needs_review";
  remarks: string[];
}

export interface EmpanelmentScreeningResult {
  eligible: boolean;
  score: number;
  result: "eligible" | "not_eligible" | "needs_review";
  category: string;
  details: EmpanelmentScreeningDetails;
}

// ─── QUALIFICATION HIERARCHY ────────────────────────────────────
// Maps qualification strings to numeric levels for comparison.
// Higher number = higher qualification.

const QUALIFICATION_HIERARCHY: Record<string, number> = {
  "Class X": 1,
  "Class XII": 2,
  "ITI/Diploma": 3,
  "Graduate (B.A./B.Sc./B.Com.)": 4,
  "B.Tech/B.E.": 5,
  "BBA/BCA": 4,
  "LLB": 5,
  "CA/ICWA (Intermediate)": 5,
  "CA/ICWA (Final)": 6,
  "Post Graduate (M.A./M.Sc./M.Com.)": 7,
  "M.Tech/M.E.": 8,
  "MBA/PGDM": 7,
  "M.Phil": 8,
  "Ph.D/Doctorate": 9,
  "Post Doctorate": 10,
};

// Broader keyword-based mapping for free-text qualification strings
const QUALIFICATION_KEYWORDS: { pattern: RegExp; level: number }[] = [
  { pattern: /post\s*doctor/i, level: 10 },
  { pattern: /ph\.?d|doctorate/i, level: 9 },
  { pattern: /m\.?\s*phil/i, level: 8 },
  { pattern: /m\.?\s*tech|m\.?\s*e\./i, level: 8 },
  { pattern: /post\s*grad|m\.?\s*a\.?|m\.?\s*sc|m\.?\s*com|mba|pgdm/i, level: 7 },
  { pattern: /ca\/icwa\s*\(?\s*final/i, level: 6 },
  { pattern: /ca|icwa|chartered\s*account/i, level: 5 },
  { pattern: /llb|law\s*degree/i, level: 5 },
  { pattern: /b\.?\s*tech|b\.?\s*e\.|engineering/i, level: 5 },
  { pattern: /graduate|b\.?\s*a\.?|b\.?\s*sc|b\.?\s*com|bba|bca|degree/i, level: 4 },
  { pattern: /iti|diploma/i, level: 3 },
  { pattern: /class\s*xii|12th|higher\s*secondary|intermediate/i, level: 2 },
  { pattern: /class\s*x|10th|secondary|matriculat/i, level: 1 },
];

// ─── HELPER FUNCTIONS ───────────────────────────────────────────

/**
 * Maps a qualification/degree string to a numeric hierarchy level.
 * Tries exact match first, then keyword-based matching.
 */
export function mapQualificationLevel(degree: string): number {
  // Try exact match from QUALIFICATION_LEVELS constant
  const exactLevel = QUALIFICATION_HIERARCHY[degree];
  if (exactLevel !== undefined) {
    return exactLevel;
  }

  // Try keyword-based matching
  for (const { pattern, level } of QUALIFICATION_KEYWORDS) {
    if (pattern.test(degree)) {
      return level;
    }
  }

  // Default: assume at least graduate level if unrecognized
  return 0;
}

/**
 * Checks whether the candidate's highest qualification meets or exceeds
 * the minimum required qualification.
 */
export function checkQualificationMeetsMinimum(
  candidateQual: string,
  requiredQual: string
): boolean {
  const candidateLevel = mapQualificationLevel(candidateQual);
  const requiredLevel = mapQualificationLevel(requiredQual);

  // If we cannot determine either level, flag for manual review
  if (candidateLevel === 0 || requiredLevel === 0) {
    return true; // don't auto-reject, let reviewer decide
  }

  return candidateLevel >= requiredLevel;
}

/**
 * Calculates total years of experience from an array of experience entries.
 * Handles overlapping periods by summing individual durations (conservative approach).
 */
export function calculateTotalExperience(
  experiences: ExperienceEntry[]
): number {
  if (!experiences || experiences.length === 0) {
    return 0;
  }

  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    const start = new Date(exp.startDate);
    const end = exp.isCurrent || !exp.endDate ? now : new Date(exp.endDate);

    if (end > start) {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  // Return years rounded to 1 decimal place
  return Math.round((totalMonths / 12) * 10) / 10;
}

/**
 * Calculates age in completed years from a date of birth.
 */
export function calculateAge(dob: Date | string): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Gets the highest qualification from a list of qualifications.
 */
function getHighestQualification(
  qualifications: QualificationEntry[] | EmpanelmentQualificationEntry[]
): { degree: string; level: number; marks: number | null } {
  if (!qualifications || qualifications.length === 0) {
    return { degree: "None", level: 0, marks: null };
  }

  // First check if any qualification is explicitly marked as highest
  const markedHighest = qualifications.find((q) => q.isHighestQualification);

  let highest = markedHighest || qualifications[0];
  let highestLevel = mapQualificationLevel(highest.degree);

  for (const q of qualifications) {
    const level = mapQualificationLevel(q.degree);
    if (level > highestLevel) {
      highest = q;
      highestLevel = level;
    }
  }

  return {
    degree: highest.degree,
    level: highestLevel,
    marks: highest.marksPercentage ?? (highest.cgpa ? highest.cgpa * 9.5 : null),
  };
}

/**
 * Gets the highest marks/percentage across all qualifications.
 */
function getHighestMarks(
  qualifications: QualificationEntry[] | EmpanelmentQualificationEntry[]
): number | null {
  if (!qualifications || qualifications.length === 0) {
    return null;
  }

  let highest: number | null = null;

  for (const q of qualifications) {
    const marks = q.marksPercentage ?? (q.cgpa ? q.cgpa * 9.5 : null);
    if (marks !== null && (highest === null || marks > highest)) {
      highest = marks;
    }
  }

  return highest;
}

/**
 * Counts government/public sector assignments from experiences,
 * consultancy projects, and trainings conducted.
 */
function countGovernmentAssignments(application: EmpanelmentApplicationData): number {
  let count = 0;

  // Count government/public experiences
  for (const exp of application.experiences || []) {
    if (
      exp.sectorType === "government" ||
      exp.sectorType === "public" ||
      exp.sectorType === "government_public"
    ) {
      count++;
    }
  }

  // Count government/public consultancy projects
  for (const proj of application.consultancyProjects || []) {
    if (
      proj.clientType === "government_public" ||
      proj.clientType === "government" ||
      proj.clientType === "public"
    ) {
      count++;
    }
  }

  // Count government/public action research projects
  for (const proj of application.actionResearchProjects || []) {
    if (
      proj.clientType === "government_public" ||
      proj.clientType === "government" ||
      proj.clientType === "public"
    ) {
      count++;
    }
  }

  // Count government/public trainings
  for (const t of application.trainingsConducted || []) {
    if (
      t.clientType === "government_public" ||
      t.clientType === "government" ||
      t.clientType === "public"
    ) {
      count++;
    }
  }

  return count;
}

/**
 * Calculates total years of Group A service from empanelment qualifications
 * and experiences.
 */
function calculateGroupAYears(
  qualifications: EmpanelmentQualificationEntry[],
  experiences: ExperienceEntry[]
): number {
  // Group A service is typically identified by the groupAService flag on qualifications
  // or by sectorType === "government" experiences with senior designations.
  // For auto-screening, we look at government experience entries as a proxy.
  const govExperiences = experiences.filter(
    (e) => e.sectorType === "government" || e.sectorType === "public"
  );

  return calculateTotalExperience(govExperiences);
}

// ─── EMPANELMENT CATEGORY REQUIREMENTS ─────────────────────────

interface CategoryRequirement {
  minExperienceYears: number;
  maxExperienceYears: number | null;
  minQualificationLevel: number; // numeric level from hierarchy
  requiredQualificationLabel: string;
  maxAge: number;
  minGroupAYears: number | null;
  minGroupALevelYears: number | null; // years in Level-12/13+
  alternateDoctorate: boolean; // Doctorate + professional standing alternate path
  alternateProfessionalYears: number | null;
}

const EMPANELMENT_CATEGORY_REQUIREMENTS: Record<string, CategoryRequirement> = {
  Advisor: {
    minExperienceYears: 20,
    maxExperienceYears: null,
    minQualificationLevel: 4, // Graduate minimum
    requiredQualificationLabel: "Graduate (or Doctorate for open market)",
    maxAge: 65,
    minGroupAYears: 20,
    minGroupALevelYears: 10, // 10 years in Level-12/13+
    alternateDoctorate: true,
    alternateProfessionalYears: 25,
  },
  "Senior Consultant": {
    minExperienceYears: 12,
    maxExperienceYears: null,
    minQualificationLevel: 4, // Graduate minimum
    requiredQualificationLabel: "Graduate (or Post Graduate for open market)",
    maxAge: 65,
    minGroupAYears: 12,
    minGroupALevelYears: 5, // 5 years in Level-12
    alternateDoctorate: false,
    alternateProfessionalYears: 13,
  },
  Consultant: {
    minExperienceYears: 6,
    maxExperienceYears: 13,
    minQualificationLevel: 5, // B.Tech/Engineering or Post Grad
    requiredQualificationLabel: "Post Graduation or Engineering degree",
    maxAge: 65,
    minGroupAYears: null,
    minGroupALevelYears: null,
    alternateDoctorate: false,
    alternateProfessionalYears: null,
  },
  "Project Associate": {
    minExperienceYears: 0,
    maxExperienceYears: 6,
    minQualificationLevel: 5, // Post Grad or Engineering
    requiredQualificationLabel: "Post Graduation or Engineering degree",
    maxAge: 65,
    minGroupAYears: null,
    minGroupALevelYears: null,
    alternateDoctorate: false,
    alternateProfessionalYears: null,
  },
  "Young Professional": {
    minExperienceYears: 0,
    maxExperienceYears: 1,
    minQualificationLevel: 5, // Professional degree from reputed institution
    requiredQualificationLabel: "Professional degree from reputed institution",
    maxAge: 35,
    minGroupAYears: null,
    minGroupALevelYears: null,
    alternateDoctorate: false,
    alternateProfessionalYears: null,
  },
};

// ─── ENGAGEMENT SCREENING ──────────────────────────────────────

/**
 * Screens an engagement application against the post requirement criteria.
 * Returns a JSON-serializable result object.
 */
export function screenEngagementApplication(
  application: EngagementApplicationData,
  postRequirement: PostRequirement
): EngagementScreeningResult {
  const remarks: string[] = [];
  let totalScore = 0;
  const maxScore = 100;

  // 1. Qualification check (30 points)
  const highestQual = getHighestQualification(application.qualifications);
  const requiredLevel = mapQualificationLevel(postRequirement.minQualification);
  const qualMet =
    highestQual.level > 0 && requiredLevel > 0
      ? highestQual.level >= requiredLevel
      : true; // if undetermined, don't auto-reject

  let qualScore = 0;
  if (qualMet) {
    // Base 20 points for meeting minimum
    qualScore = 20;
    // Bonus up to 10 points for exceeding the requirement
    const excessLevels = Math.min(highestQual.level - requiredLevel, 3);
    qualScore += Math.max(0, excessLevels) * 3.33;
    qualScore = Math.min(30, Math.round(qualScore * 100) / 100);
  }
  totalScore += qualScore;

  const qualificationMatch = {
    met: qualMet,
    candidateLevel: highestQual.level,
    requiredLevel,
    candidateHighestDegree: highestQual.degree,
    requiredQualification: postRequirement.minQualification,
    remarks: qualMet
      ? `Qualification requirement met. Candidate holds ${highestQual.degree}.`
      : `Qualification requirement NOT met. Required: ${postRequirement.minQualification}, Candidate holds: ${highestQual.degree}.`,
  };

  if (!qualMet) {
    remarks.push(
      `Qualification shortfall: Required ${postRequirement.minQualification}, candidate has ${highestQual.degree}`
    );
  }

  // 2. Experience check (30 points)
  const candidateTotalYears = calculateTotalExperience(application.experiences);
  const requiredYears = postRequirement.minExperienceYears;
  const expMet = candidateTotalYears >= requiredYears;

  let expScore = 0;
  if (expMet) {
    // Base 20 points for meeting minimum
    expScore = 20;
    // Bonus points for exceeding (up to 10 points for 10+ extra years)
    const excessYears = Math.min(candidateTotalYears - requiredYears, 10);
    expScore += excessYears;
    expScore = Math.min(30, expScore);
  } else if (requiredYears > 0) {
    // Partial credit if close
    const ratio = candidateTotalYears / requiredYears;
    expScore = Math.round(ratio * 20);
  }
  totalScore += expScore;

  const experienceMatch = {
    met: expMet,
    candidateTotalYears,
    requiredYears,
    remarks: expMet
      ? `Experience requirement met. Candidate has ${candidateTotalYears} years (required: ${requiredYears}).`
      : `Experience requirement NOT met. Candidate has ${candidateTotalYears} years (required: ${requiredYears}).`,
  };

  if (!expMet) {
    remarks.push(
      `Experience shortfall: Required ${requiredYears} years, candidate has ${candidateTotalYears} years`
    );
  }

  // 3. Age check (10 points)
  const candidateAge = calculateAge(application.dateOfBirth);
  const maxAge = postRequirement.maxAgeLimitYears;
  const ageMet = maxAge === null || maxAge === 0 || candidateAge <= maxAge;
  const ageScore = ageMet ? 10 : 0;
  totalScore += ageScore;

  const ageMatch = {
    met: ageMet,
    candidateAge,
    maxAge,
    remarks: maxAge
      ? ageMet
        ? `Age requirement met. Candidate is ${candidateAge} years old (max: ${maxAge}).`
        : `Age limit exceeded. Candidate is ${candidateAge} years old (max: ${maxAge}).`
      : "No age limit specified for this post.",
  };

  if (!ageMet) {
    remarks.push(
      `Age limit exceeded: Candidate is ${candidateAge} years old, maximum is ${maxAge}`
    );
  }

  // 4. Retired person check (10 points)
  const isRetired = application.isRetiredPerson;
  const ppoProvided = !!(application.ppoNumber && application.ppoNumber.trim());
  const retiredCheckOk = !isRetired || ppoProvided;
  const retiredScore = retiredCheckOk ? 10 : 5; // partial if retired but no PPO
  totalScore += retiredScore;

  const retiredPersonCheck = {
    applicable: isRetired,
    ppoProvided,
    remarks: !isRetired
      ? "Not applicable (candidate is not a retired person)."
      : ppoProvided
        ? `Retired person with PPO number: ${application.ppoNumber}.`
        : "Retired person but PPO number not provided. Manual verification required.",
  };

  if (isRetired && !ppoProvided) {
    remarks.push(
      "Retired person has not provided PPO number. Manual verification required."
    );
  }

  // 5. Remuneration band based on marks (20 points)
  const highestMarks = getHighestMarks(application.qualifications);
  let remunerationPercent = 90; // default to 90% of max
  let marksScore = 15;

  if (highestMarks !== null) {
    if (highestMarks > 80) {
      remunerationPercent = 100;
      marksScore = 20;
    } else if (highestMarks >= 60) {
      remunerationPercent = 90;
      marksScore = 15;
    } else {
      remunerationPercent = 80;
      marksScore = 10;
    }
  }
  totalScore += marksScore;

  const remunerationBand = {
    percentageOfMax: remunerationPercent,
    highestMarks,
    remarks:
      highestMarks !== null
        ? `Highest marks: ${highestMarks}%. Eligible for ${remunerationPercent}% of maximum remuneration.`
        : "Marks/percentage not provided. Defaulting to 90% of maximum remuneration.",
  };

  // Determine overall result
  const criticalFailures = !qualMet || !expMet || !ageMet;
  const needsReview = !criticalFailures && (isRetired && !ppoProvided);

  let overallResult: "eligible" | "not_eligible" | "needs_review";
  if (criticalFailures) {
    overallResult = "not_eligible";
  } else if (needsReview || highestQual.level === 0 || requiredLevel === 0) {
    overallResult = "needs_review";
  } else {
    overallResult = "eligible";
  }

  // Normalize score to 0-100
  const finalScore = Math.min(100, Math.round(totalScore * 100) / 100);

  if (overallResult === "eligible" && remarks.length === 0) {
    remarks.push("All screening criteria met. Candidate is eligible.");
  }

  return {
    eligible: overallResult === "eligible",
    score: finalScore,
    result: overallResult,
    details: {
      qualificationMatch,
      experienceMatch,
      ageMatch,
      retiredPersonCheck,
      remunerationBand,
      overallResult,
      remarks,
    },
  };
}

// ─── EMPANELMENT SCREENING ─────────────────────────────────────

/**
 * Screens an empanelment application against the AI 859 category matrix.
 * Returns a JSON-serializable result object.
 */
export function screenEmpanelmentApplication(
  application: EmpanelmentApplicationData
): EmpanelmentScreeningResult {
  const category = application.categoryApplied;
  const requirements = EMPANELMENT_CATEGORY_REQUIREMENTS[category];
  const remarks: string[] = [];
  let totalScore = 0;
  const maxScore = 100;

  if (!requirements) {
    return {
      eligible: false,
      score: 0,
      result: "not_eligible",
      category,
      details: {
        qualificationMatch: {
          met: false,
          candidateLevel: 0,
          requiredLevel: 0,
          candidateHighestDegree: "Unknown",
          requiredQualification: "Unknown",
          remarks: `Invalid empanelment category: ${category}`,
        },
        experienceMatch: {
          met: false,
          candidateTotalYears: 0,
          requiredMinYears: 0,
          requiredMaxYears: null,
          remarks: `Invalid empanelment category: ${category}`,
        },
        ageMatch: {
          met: false,
          candidateAge: 0,
          maxAge: 0,
          remarks: `Invalid empanelment category: ${category}`,
        },
        groupAServiceCheck: {
          applicable: false,
          totalGroupAYears: 0,
          met: false,
          remarks: `Invalid empanelment category: ${category}`,
        },
        governmentAssignments: {
          count: 0,
          preferred: 5,
          met: false,
          remarks: `Invalid empanelment category: ${category}`,
        },
        domainExpertise: {
          domainsApplied: [],
          relevantExperienceFound: false,
          remarks: `Invalid empanelment category: ${category}`,
        },
        overallResult: "not_eligible",
        remarks: [`Invalid empanelment category: ${category}`],
      },
    };
  }

  // 1. Qualification check (25 points)
  const highestQual = getHighestQualification(application.qualifications);
  const requiredLevel = requirements.minQualificationLevel;
  let qualMet = highestQual.level >= requiredLevel;

  // For Advisor: check alternate path (Doctorate + 25 years professional standing)
  const hasDoctorate = highestQual.level >= 9; // Ph.D or above
  let alternatePathUsed = false;

  if (!qualMet && requirements.alternateDoctorate && hasDoctorate) {
    qualMet = true;
    alternatePathUsed = true;
  }

  // For Senior Consultant: Post Grad + 13 years alternate
  if (!qualMet && category === "Senior Consultant" && highestQual.level >= 7) {
    qualMet = true;
    alternatePathUsed = true;
  }

  let qualScore = 0;
  if (qualMet) {
    qualScore = 20;
    const excessLevels = Math.min(highestQual.level - requiredLevel, 3);
    qualScore += Math.max(0, excessLevels) * 1.67;
    qualScore = Math.min(25, Math.round(qualScore * 100) / 100);
  }
  totalScore += qualScore;

  const qualificationMatch = {
    met: qualMet,
    candidateLevel: highestQual.level,
    requiredLevel,
    candidateHighestDegree: highestQual.degree,
    requiredQualification: requirements.requiredQualificationLabel,
    remarks: qualMet
      ? alternatePathUsed
        ? `Qualification met via alternate eligibility path. Candidate holds ${highestQual.degree}.`
        : `Qualification requirement met. Candidate holds ${highestQual.degree}.`
      : `Qualification requirement NOT met for ${category}. Required: ${requirements.requiredQualificationLabel}, Candidate holds: ${highestQual.degree}.`,
  };

  if (!qualMet) {
    remarks.push(
      `Qualification shortfall for ${category}: Required ${requirements.requiredQualificationLabel}, candidate has ${highestQual.degree}`
    );
  }

  // 2. Experience check (25 points)
  const candidateTotalYears = calculateTotalExperience(application.experiences);
  const minYears = requirements.minExperienceYears;
  const maxYears = requirements.maxExperienceYears;

  let expMet = candidateTotalYears >= minYears;

  // For Advisor alternate path: Doctorate + 25 years professional standing
  if (
    !expMet &&
    requirements.alternateDoctorate &&
    hasDoctorate &&
    requirements.alternateProfessionalYears
  ) {
    expMet = candidateTotalYears >= requirements.alternateProfessionalYears;
    if (expMet) {
      alternatePathUsed = true;
    }
  }

  // For Senior Consultant alternate path: Post Grad + 13 years
  if (
    !expMet &&
    category === "Senior Consultant" &&
    highestQual.level >= 7 &&
    requirements.alternateProfessionalYears
  ) {
    expMet = candidateTotalYears >= requirements.alternateProfessionalYears;
    if (expMet) {
      alternatePathUsed = true;
    }
  }

  // Check upper bound for categories with max experience limits
  let expInRange = expMet;
  if (maxYears !== null && candidateTotalYears > maxYears) {
    // Exceeding max for the category. Suggest higher category.
    expInRange = false;
    remarks.push(
      `Experience (${candidateTotalYears} years) exceeds the typical range for ${category} (${minYears}-${maxYears} years). Consider applying for a higher category.`
    );
  }

  let expScore = 0;
  if (expMet) {
    expScore = 20;
    // Bonus for exceeding minimum within range
    if (maxYears !== null && candidateTotalYears <= maxYears) {
      const range = maxYears - minYears;
      if (range > 0) {
        const inRangePosition = (candidateTotalYears - minYears) / range;
        expScore += Math.round(inRangePosition * 5);
      }
    } else if (maxYears === null) {
      const excessYears = Math.min(candidateTotalYears - minYears, 10);
      expScore += Math.round(excessYears * 0.5);
    }
    expScore = Math.min(25, expScore);
  } else if (minYears > 0) {
    const ratio = candidateTotalYears / minYears;
    expScore = Math.round(ratio * 15);
  }
  totalScore += expScore;

  const experienceMatch = {
    met: expMet,
    candidateTotalYears,
    requiredMinYears: minYears,
    requiredMaxYears: maxYears,
    remarks: expMet
      ? maxYears !== null
        ? `Experience requirement met. Candidate has ${candidateTotalYears} years (range: ${minYears}-${maxYears}).`
        : `Experience requirement met. Candidate has ${candidateTotalYears} years (minimum: ${minYears}).`
      : `Experience requirement NOT met. Candidate has ${candidateTotalYears} years (minimum required: ${minYears}).`,
  };

  if (!expMet) {
    remarks.push(
      `Experience shortfall for ${category}: Required minimum ${minYears} years, candidate has ${candidateTotalYears} years`
    );
  }

  // 3. Age check (10 points)
  const candidateAge = calculateAge(application.dateOfBirth);
  const maxAge = requirements.maxAge;
  const ageMet = candidateAge <= maxAge;
  const ageScore = ageMet ? 10 : 0;
  totalScore += ageScore;

  const ageMatch = {
    met: ageMet,
    candidateAge,
    maxAge,
    remarks: ageMet
      ? `Age requirement met. Candidate is ${candidateAge} years old (max: ${maxAge}).`
      : `Age limit exceeded. Candidate is ${candidateAge} years old (max: ${maxAge}).`,
  };

  if (!ageMet) {
    remarks.push(
      `Age limit exceeded for ${category}: Candidate is ${candidateAge}, maximum is ${maxAge}`
    );
  }

  // 4. Group A service check - applicable for Advisor and Senior Consultant (15 points)
  const groupAApplicable =
    requirements.minGroupAYears !== null && requirements.minGroupAYears > 0;
  const groupAYears = groupAApplicable
    ? calculateGroupAYears(
        application.qualifications,
        application.experiences
      )
    : 0;
  const groupAMet = !groupAApplicable || groupAYears >= (requirements.minGroupAYears || 0);

  let groupAScore = 0;
  if (groupAApplicable) {
    if (groupAMet) {
      groupAScore = 15;
    } else if (alternatePathUsed) {
      // Alternate eligibility path does not require Group A
      groupAScore = 12;
    } else {
      const ratio =
        requirements.minGroupAYears && requirements.minGroupAYears > 0
          ? groupAYears / requirements.minGroupAYears
          : 0;
      groupAScore = Math.round(ratio * 10);
    }
  } else {
    // Not applicable, grant full points
    groupAScore = 15;
  }
  totalScore += groupAScore;

  const groupAServiceCheck = {
    applicable: groupAApplicable,
    totalGroupAYears: groupAYears,
    met: groupAMet || alternatePathUsed,
    remarks: !groupAApplicable
      ? `Group A service check not applicable for ${category}.`
      : groupAMet
        ? `Group A service requirement met. Candidate has ${groupAYears} years of government/public service.`
        : alternatePathUsed
          ? `Group A service not fully met (${groupAYears} years), but alternate eligibility path applies.`
          : `Group A service requirement NOT met. Required: ${requirements.minGroupAYears} years, candidate has: ${groupAYears} years.`,
  };

  if (groupAApplicable && !groupAMet && !alternatePathUsed) {
    remarks.push(
      `Group A service shortfall: Required ${requirements.minGroupAYears} years, candidate has ${groupAYears} years`
    );
  }

  // 5. Government assignments check (15 points)
  const govAssignmentCount = countGovernmentAssignments(application);
  const preferredGovAssignments = 5;
  const govAssignmentsMet = govAssignmentCount >= preferredGovAssignments;

  let govScore = 0;
  if (govAssignmentsMet) {
    govScore = 15;
  } else {
    // Proportional scoring
    govScore = Math.round((govAssignmentCount / preferredGovAssignments) * 15);
  }
  totalScore += govScore;

  const governmentAssignments = {
    count: govAssignmentCount,
    preferred: preferredGovAssignments,
    met: govAssignmentsMet,
    remarks: govAssignmentsMet
      ? `Government/public sector assignments: ${govAssignmentCount} (preferred: ${preferredGovAssignments}+). Requirement met.`
      : `Government/public sector assignments: ${govAssignmentCount} (preferred: ${preferredGovAssignments}+). Below preferred threshold.`,
  };

  if (!govAssignmentsMet) {
    remarks.push(
      `Government/public assignments below preferred threshold: ${govAssignmentCount} of ${preferredGovAssignments} preferred`
    );
  }

  // 6. Domain expertise alignment (10 points)
  const domainsApplied = application.domains
    ? application.domains.split(",").map((d: string) => d.trim())
    : [];
  const areasOfExpertise = application.areasOfExpertise
    ? application.areasOfExpertise.split(",").map((a: string) => a.trim().toLowerCase())
    : [];

  // Check if experience descriptions mention the applied domains or expertise areas
  let relevantExperienceFound = false;
  const experienceTexts = (application.experiences || [])
    .map((e) => `${e.dutiesDescription} ${e.designation} ${e.organizationName}`.toLowerCase());

  const projectTexts = [
    ...(application.consultancyProjects || []).map(
      (p) => `${p.projectTitle} ${p.projectDescription} ${p.clientOrganization}`.toLowerCase()
    ),
    ...(application.actionResearchProjects || []).map(
      (p) => `${p.projectTitle} ${p.projectDescription} ${p.clientOrganization}`.toLowerCase()
    ),
  ];

  const allTexts = [...experienceTexts, ...projectTexts];

  // Check if any area of expertise appears in experience/project descriptions
  for (const area of areasOfExpertise) {
    if (area.length >= 3) {
      for (const text of allTexts) {
        if (text.includes(area)) {
          relevantExperienceFound = true;
          break;
        }
      }
    }
    if (relevantExperienceFound) break;
  }

  // If we have certifications or memberships, also count as domain alignment
  if (
    !relevantExperienceFound &&
    ((application.certifications && application.certifications.length > 0) ||
      (application.professionalMemberships && application.professionalMemberships.length > 0))
  ) {
    relevantExperienceFound = true;
  }

  // If we couldn't determine alignment (no text analysis), don't penalize
  if (allTexts.length === 0 && areasOfExpertise.length === 0) {
    relevantExperienceFound = true;
  }

  const domainScore = relevantExperienceFound ? 10 : 5;
  totalScore += domainScore;

  const domainExpertise = {
    domainsApplied,
    relevantExperienceFound,
    remarks: relevantExperienceFound
      ? `Domain expertise alignment verified for: ${domainsApplied.join(", ")}.`
      : `Could not verify domain expertise alignment for: ${domainsApplied.join(", ")}. Manual review recommended.`,
  };

  if (!relevantExperienceFound) {
    remarks.push(
      "Domain expertise alignment could not be automatically verified. Manual review recommended."
    );
  }

  // Determine overall result
  const criticalFailures = !qualMet || !expMet || !ageMet;
  const needsManualReview =
    !criticalFailures &&
    ((!groupAMet && groupAApplicable && !alternatePathUsed) ||
      !relevantExperienceFound ||
      !expInRange);

  let overallResult: "eligible" | "not_eligible" | "needs_review";
  if (criticalFailures) {
    overallResult = "not_eligible";
  } else if (needsManualReview) {
    overallResult = "needs_review";
  } else {
    overallResult = "eligible";
  }

  const finalScore = Math.min(100, Math.round(totalScore * 100) / 100);

  if (overallResult === "eligible" && remarks.length === 0) {
    remarks.push(
      `All screening criteria met for ${category} category. Candidate is eligible for empanelment.`
    );
  }

  return {
    eligible: overallResult === "eligible",
    score: finalScore,
    result: overallResult,
    category,
    details: {
      qualificationMatch,
      experienceMatch,
      ageMatch,
      groupAServiceCheck,
      governmentAssignments,
      domainExpertise,
      overallResult,
      remarks,
    },
  };
}

// ─── UNIFIED SCREENING ENTRY POINT ─────────────────────────────
// Used by the screening API route.

export async function runScreening(
  application: EngagementApplicationData | EmpanelmentApplicationData,
  type: "engagement" | "empanelment"
): Promise<{
  score: number;
  result: "eligible" | "not_eligible" | "needs_review";
  details: Record<string, unknown>;
}> {
  if (type === "engagement") {
    const engApp = application as EngagementApplicationData;
    const result = screenEngagementApplication(engApp, engApp.postRequirement);
    return {
      score: result.score,
      result: result.result,
      details: result.details as unknown as Record<string, unknown>,
    };
  } else {
    const empApp = application as EmpanelmentApplicationData;
    const result = screenEmpanelmentApplication(empApp);
    return {
      score: result.score,
      result: result.result,
      details: {
        ...result.details,
        category: result.category,
      } as unknown as Record<string, unknown>,
    };
  }
}
