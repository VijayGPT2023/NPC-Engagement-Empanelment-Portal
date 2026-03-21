// ─── NPC OFFICES ────────────────────────────────────────────────

export const NPC_OFFICES = [
  { code: "HQ", name: "Headquarters, New Delhi", city: "New Delhi" },
  { code: "BLR", name: "Regional Office, Bengaluru", city: "Bengaluru" },
  { code: "BBS", name: "Regional Office, Bhubaneswar", city: "Bhubaneswar" },
  { code: "CHD", name: "Regional Office, Chandigarh", city: "Chandigarh" },
  { code: "CHN", name: "Regional Office, Chennai", city: "Chennai" },
  { code: "GN", name: "Regional Office, Gandhinagar", city: "Gandhinagar" },
  { code: "GHY", name: "Regional Office, Guwahati", city: "Guwahati" },
  { code: "HYD", name: "Regional Office, Hyderabad", city: "Hyderabad" },
  { code: "JAI", name: "Regional Office, Jaipur", city: "Jaipur" },
  { code: "KNP", name: "Regional Office, Kanpur", city: "Kanpur" },
  { code: "KOL", name: "Regional Office, Kolkata", city: "Kolkata" },
  { code: "MUM", name: "Regional Office, Mumbai", city: "Mumbai" },
  { code: "PAT", name: "Regional Office, Patna", city: "Patna" },
] as const;

// ─── DOMAINS / DIVISIONS ───────────────────────────────────────

export const NPC_DOMAINS = [
  { code: "AB", name: "Agri-Business Services" },
  { code: "ES", name: "Economic Services" },
  { code: "ECA", name: "Environment & Climate Action" },
  { code: "EM", name: "Energy Management" },
  { code: "HRM", name: "Human Resource Management" },
  { code: "IE", name: "Industrial Engineering" },
  { code: "IT", name: "Information Technology" },
  { code: "FIN", name: "Finance" },
  { code: "ADM", name: "Administration" },
  { code: "ID", name: "Inspection Division" },
  { code: "IS", name: "International Services" },
] as const;

// ─── ENGAGEMENT TYPES (AI 858) ──────────────────────────────────

export const ENGAGEMENT_TYPES = [
  { code: "full_time", name: "Full Time" },
  { code: "part_time", name: "Part Time" },
  { code: "lump_sum", name: "Lump Sum Basis" },
  { code: "revenue_sharing", name: "Revenue Sharing Basis" },
  { code: "resource_person", name: "Resource Person" },
] as const;

// ─── DESIGNATIONS / FUNCTIONAL ROLES (Annex-II-A & II-B) ───────

export const DESIGNATIONS = [
  {
    code: "support_executive",
    name: "Support Executive",
    minQualification: "Class XII Pass",
    minExperience: 0,
    maxRemuneration: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    notes: "As per minimum wages, preferably from Manpower Agency",
  },
  {
    code: "office_executive",
    name: "Office Executive / Data Entry Operator / Accounts Executive",
    minQualification: "Graduate degree from recognized university/institution with knowledge of working on computer",
    minExperience: 0,
    maxRemuneration: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    code: "technical_executive",
    name: "Technical Executive",
    minQualification: "ITI in relevant trade (NCVT/SCVT) OR Diploma in relevant Engineering discipline from recognized institution",
    minExperience: 0,
    maxRemuneration: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    code: "legal_executive",
    name: "Legal Executive",
    minQualification: "Degree in Law from a government recognized university",
    minExperience: 0,
    maxRemuneration: { 0: 25000, 1: 28000, 2: 35000, 3: 42000, 4: 48000, 5: 55000 },
  },
  {
    code: "project_executive",
    name: "Project Executive / Research Executive",
    minQualification: "Graduate degree in relevant discipline from recognized university/institution",
    minExperience: 0,
    maxRemuneration: { 0: 28000, 1: 35000, 2: 44000, 3: 50000, 4: 57000, 5: 65000 },
  },
  {
    code: "senior_professional",
    name: "Senior Professional",
    minQualification: "Post-graduation in relevant discipline from govt recognized university/institution OR Graduate with Intermediate in CA/ICWA OR MBA in any discipline",
    minExperience: 0,
    maxRemuneration: { 0: 34000, 1: 40000, 2: 48000, 3: 55000, 4: 62000, 5: 70000 },
  },
  {
    code: "young_professional",
    name: "Young Professional",
    minQualification: "Professional degree from a reputed institute preferably from premier institute such as ISI, IIT, DCE, IIM etc. with relevant experience of 0-1 years",
    minExperience: 0,
    maxRemuneration: { 0: 60000 },
    maxAge: 35,
    maxTenure: "3 years",
  },
  {
    code: "consultant",
    name: "Consultant",
    minQualification: "Graduate in any discipline from a government recognized university/institution relevant to the work requirement",
    minExperience: 6,
    maxAge: 65,
    monthlyRemuneration: 75000,
    dailyRate: 5000,
  },
  {
    code: "senior_consultant",
    name: "Senior Consultant",
    minQualification: "Graduate in any discipline from a government recognized university/institution relevant to the work requirement",
    minExperience: 10,
    maxAge: 65,
    monthlyRemuneration: 90000,
    dailyRate: 6000,
  },
  {
    code: "advisor",
    name: "Advisor",
    minQualification: "Graduate in any discipline from a government recognized university/institution relevant to the work requirement",
    minExperience: 20,
    maxAge: 65,
    monthlyRemuneration: 125000,
    dailyRate: 10000,
  },
  {
    code: "senior_advisor",
    name: "Senior Advisor",
    minQualification: "Retired from Government of India from Secretary Level OR Doctorate in any discipline from a government recognized university/institution",
    minExperience: 20,
    maxAge: 65,
    monthlyRemuneration: 150000,
    dailyRate: 12000,
  },
  {
    code: "expert",
    name: "Expert",
    minQualification: "Any Retired Person from Government/CPSE/Autonomous Body/Statutory Body",
    minExperience: 0,
    notes: "50% of (last Pay Basic) plus current DA at time of remuneration fixation",
  },
] as const;

// ─── EMPANELMENT CATEGORIES (AI 859) ────────────────────────────

export const EMPANELMENT_CATEGORIES = [
  {
    code: "advisor",
    name: "Advisor",
    eligibility: "Minimum 20 years in Group A with at least 10 years in Level-12/13 or above; OR from open market with Doctorate and 25 years professional standing",
    remarks: "Highest level expert",
  },
  {
    code: "senior_consultant",
    name: "Senior Consultant",
    eligibility: "12+ years with at least 5 years in Level-12; OR from open market with Post Graduation and 13 years professional standing",
    remarks: "Senior level expert",
  },
  {
    code: "consultant",
    name: "Consultant",
    eligibility: "6-13 years of experience with Post Graduation/Engineering degree",
    remarks: "Mid-level expert",
  },
  {
    code: "project_associate",
    name: "Project Associate",
    eligibility: "0-6 years of experience with Post Graduation/Engineering degree",
    remarks: "Entry to mid-level",
  },
  {
    code: "young_professional",
    name: "Young Professional",
    eligibility: "Relevant professional degree from reputed institutions (ISI, IIT, DCS, IIM, etc.) with maximum age of 35 years",
    remarks: "For exceptional young talent",
  },
] as const;

// ─── SERVICE TYPES ──────────────────────────────────────────────

export const SERVICE_TYPES = [
  { code: "consultancy", name: "Consultancy / Action Research Services" },
  { code: "training", name: "Training & Capacity Building Services" },
  { code: "both", name: "Both Consultancy & Training Services" },
] as const;

// ─── DOCUMENT TYPES ─────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  { code: "photo", name: "Passport Size Photograph", required: true },
  { code: "cv", name: "Updated Duly Signed CV", required: true },
  { code: "aadhaar", name: "Aadhaar Card", required: true },
  { code: "dob_proof", name: "Date of Birth Proof", required: true },
  { code: "qualification", name: "Educational/Technical Qualification Certificate", required: true },
  { code: "experience", name: "Experience Certificate", required: false },
  { code: "ppo", name: "PPO (Pension Payment Order) - For retired persons", required: false },
  { code: "other", name: "Other Supporting Document", required: false },
] as const;

// ─── APPLICATION STATUS ─────────────────────────────────────────

export const ENGAGEMENT_STATUSES = [
  { code: "submitted", name: "Submitted", color: "blue" },
  { code: "under_screening", name: "Under Screening", color: "yellow" },
  { code: "shortlisted", name: "Shortlisted", color: "green" },
  { code: "selected", name: "Selected", color: "emerald" },
  { code: "rejected", name: "Rejected", color: "red" },
  { code: "offered", name: "Offer Sent", color: "purple" },
  { code: "accepted", name: "Accepted", color: "teal" },
] as const;

export const EMPANELMENT_STATUSES = [
  { code: "submitted", name: "Submitted", color: "blue" },
  { code: "under_screening", name: "Under Screening", color: "yellow" },
  { code: "shortlisted", name: "Shortlisted by Screening Committee", color: "green" },
  { code: "interview_scheduled", name: "Interview Scheduled", color: "orange" },
  { code: "empanelled", name: "Empanelled", color: "emerald" },
  { code: "rejected", name: "Rejected", color: "red" },
] as const;

// ─── TITLES ─────────────────────────────────────────────────────

export const TITLES = ["Dr.", "Mr.", "Mrs.", "Ms."] as const;

// ─── QUALIFICATION LEVELS ───────────────────────────────────────

export const QUALIFICATION_LEVELS = [
  "Class X",
  "Class XII",
  "ITI/Diploma",
  "Graduate (B.A./B.Sc./B.Com.)",
  "B.Tech/B.E.",
  "BBA/BCA",
  "LLB",
  "CA/ICWA (Intermediate)",
  "CA/ICWA (Final)",
  "Post Graduate (M.A./M.Sc./M.Com.)",
  "M.Tech/M.E.",
  "MBA/PGDM",
  "M.Phil",
  "Ph.D/Doctorate",
  "Post Doctorate",
  "Other",
] as const;

// ─── LUMP SUM REMUNERATION (C.2.2) ─────────────────────────────

export const LUMP_SUM_RATES = [
  { maxProjectValue: 2500000, maxPercentage: 20 },
  { maxProjectValue: 10000000, maxPercentage: 15 },
  { maxProjectValue: Infinity, maxPercentage: 10 },
] as const;

// ─── RESOURCE PERSON RATES (C.4) ────────────────────────────────

export const RESOURCE_PERSON_RATES = [
  { level: "Resource Person", traditional: 4500, innovative: 6000 },
  { level: "Senior Resource Person", traditional: 6500, innovative: 8000 },
  { level: "Eminent Resource Person", traditional: 9000, innovative: 12000 },
] as const;

// ─── PERFORMANCE RATING (Annex-IV) ─────────────────────────────

export const PERFORMANCE_CRITERIA = [
  "Practical knowledge and experience",
  "Ability to adapt knowledge and experience to assigned tasks",
  "Initiative",
  "Productivity",
  "Teamwork Ability",
  "Adherence to NPC's Regulations",
  "Work Quality",
  "Meeting Timelines",
] as const;

export const REMUNERATION_HIKE_MATRIX = [
  { minScore: 4.50, maxScore: 5.00, label: "Excellent", hikePercent: 100 },
  { minScore: 4.00, maxScore: 4.49, label: "Very Good", hikePercent: 90 },
  { minScore: 3.50, maxScore: 3.99, label: "Good", hikePercent: 80 },
  { minScore: 3.00, maxScore: 3.49, label: "Average", hikePercent: 70 },
] as const;
