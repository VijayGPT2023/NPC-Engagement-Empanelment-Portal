import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@npcindia.gov.in" },
  });

  if (!admin) {
    console.error("Admin user not found. Run the main seed first.");
    process.exit(1);
  }

  const posts = [
    {
      advertisementNo: "NPC/HQ/2026/003",
      title: "Senior Consultant - Human Resource Management",
      functionalRole: "senior_consultant",
      domain: "HRM",
      engagementType: "full_time",
      numberOfPositions: 2,
      placeOfDeployment: "HQ",
      minQualification: "Post Graduate degree/diploma in HRM/Personnel Management/MBA(HR) from a recognized university",
      minExperienceYears: 10,
      maxAgeLimitYears: 63,
      remunerationRange: "Rs. 90,000/month (Fixed) or Rs. 6,000/day",
      contractPeriod: "1 year (extendable up to 3 years)",
      eligibilityCriteria: "Post Graduate in HRM/Personnel Management/MBA(HR) with minimum 10 years of experience in HR consultancy, organizational development, or manpower planning. Experience in government/PSU sector preferred. Should have handled at least 5 HR consulting assignments in Govt/Public sector.",
      workResponsibilities: "1. Lead HR consultancy and organizational restructuring projects\n2. Design and conduct training need assessments\n3. Develop HR policies and manuals for client organizations\n4. Conduct manpower audits and workforce planning studies\n5. Mentor junior consultants and project associates",
      termsAndConditions: "Purely contractual engagement. No claim for regular appointment. Travel as required.",
      applicationDeadline: new Date("2026-05-15"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/DEL/2026/001",
      title: "Consultant - Finance & Accounts",
      functionalRole: "consultant",
      domain: "FIN",
      engagementType: "full_time",
      numberOfPositions: 1,
      placeOfDeployment: "HQ",
      minQualification: "CA/ICWA/MBA(Finance) from a recognized institution",
      minExperienceYears: 6,
      maxAgeLimitYears: 60,
      remunerationRange: "Rs. 75,000/month (Fixed) or Rs. 5,000/day",
      contractPeriod: "1 year (extendable)",
      eligibilityCriteria: "Chartered Accountant or ICWA or MBA(Finance) with minimum 6 years experience in financial analysis, cost management, or financial consultancy. Experience in government financial management preferred. Knowledge of GFR 2017, PFMS, GeM portal desirable.",
      workResponsibilities: "1. Conduct financial analysis and cost optimization studies\n2. Prepare financial feasibility reports for government projects\n3. Support financial management training programs\n4. Assist in audit and compliance reviews\n5. Prepare MIS reports and financial dashboards",
      termsAndConditions: "Purely contractual engagement. No claim for regular appointment.",
      applicationDeadline: new Date("2026-05-10"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/KOL/2026/001",
      title: "Project Associate - Economics Research",
      functionalRole: "project_associate",
      domain: "ES",
      engagementType: "full_time",
      numberOfPositions: 3,
      placeOfDeployment: "KOL",
      minQualification: "Post Graduate degree in Economics/Statistics/Econometrics from a recognized university",
      minExperienceYears: 1,
      maxAgeLimitYears: 40,
      remunerationRange: "Rs. 40,000 - Rs. 65,000/month based on experience",
      contractPeriod: "1 year (extendable up to 2 years)",
      eligibilityCriteria: "Post Graduate in Economics/Statistics/Econometrics with minimum 1 year experience in economic research, data analysis, or policy studies. Proficiency in SPSS/STATA/R is required. Published research papers preferred.",
      workResponsibilities: "1. Conduct economic surveys and data collection\n2. Perform statistical analysis using SPSS/STATA/R\n3. Prepare economic impact assessment reports\n4. Support productivity measurement studies\n5. Assist in preparation of research papers and policy briefs",
      termsAndConditions: "Purely contractual engagement. Posted at Kolkata Regional Directorate.",
      applicationDeadline: new Date("2026-06-01"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/JAI/2026/001",
      title: "Young Professional - Information Technology",
      functionalRole: "young_professional",
      domain: "IT",
      engagementType: "full_time",
      numberOfPositions: 2,
      placeOfDeployment: "JAI",
      minQualification: "B.Tech/B.E./MCA in Computer Science/IT from a reputed institute",
      minExperienceYears: 0,
      maxAgeLimitYears: 30,
      remunerationRange: "Rs. 60,000/month (Fixed)",
      contractPeriod: "Up to 3 years",
      eligibilityCriteria: "B.Tech/B.E./MCA in Computer Science or IT from a recognized institute. Maximum age 30 years. Freshers or up to 1 year experience. Knowledge of React/Next.js, Node.js, PostgreSQL, cloud deployment preferred. GATE/NET qualified candidates given preference.",
      workResponsibilities: "1. Develop and maintain web-based applications and portals\n2. Support IT infrastructure of regional directorate\n3. Implement e-Governance solutions for client organizations\n4. Provide technical support for digital transformation projects\n5. Prepare technical documentation and user manuals",
      termsAndConditions: "Maximum tenure 3 years. Posted at Jaipur Regional Directorate. Purely contractual.",
      applicationDeadline: new Date("2026-06-15"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/HYD/2026/001",
      title: "Advisor - Environment & Climate Action",
      functionalRole: "advisor",
      domain: "ECA",
      engagementType: "full_time",
      numberOfPositions: 1,
      placeOfDeployment: "HYD",
      minQualification: "Ph.D. or Post Graduate degree in Environmental Science/Engineering from a recognized university",
      minExperienceYears: 20,
      maxAgeLimitYears: 65,
      remunerationRange: "Rs. 1,25,000/month (Fixed) or Rs. 10,000/day",
      contractPeriod: "1 year (extendable)",
      eligibilityCriteria: "Ph.D. or Post Graduate in Environmental Science/Engineering with minimum 20 years experience. Expertise in EIA, carbon footprint assessment, ESG frameworks mandatory. Should have led at least 10 major environmental consultancy projects. Experience with MOEFCC, CPCB, SPCBs preferred. Published research in environmental management required.",
      workResponsibilities: "1. Lead environmental impact assessment projects\n2. Develop carbon neutrality roadmaps for industries\n3. Advise on ESG compliance and sustainability strategies\n4. Conduct environmental audit and compliance studies\n5. Mentor and guide junior environmental consultants\n6. Represent NPC at national/international environmental forums",
      termsAndConditions: "Purely contractual engagement. Extensive travel required. Posted at Hyderabad Regional Directorate.",
      applicationDeadline: new Date("2026-05-25"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/GUW/2026/001",
      title: "Project Executive - Agri Business (North East)",
      functionalRole: "project_executive",
      domain: "AB",
      engagementType: "full_time",
      numberOfPositions: 4,
      placeOfDeployment: "GUW",
      minQualification: "Graduate in Agriculture/Horticulture/Food Technology/Rural Management from a recognized university",
      minExperienceYears: 2,
      maxAgeLimitYears: 45,
      remunerationRange: "Rs. 28,000 - Rs. 50,000/month based on experience",
      contractPeriod: "1 year (extendable up to 2 years)",
      eligibilityCriteria: "Graduate in Agriculture, Horticulture, Food Technology, or Rural Management with minimum 2 years experience in agricultural extension, FPO development, or agri-business consultancy. Candidates from North Eastern states given preference. Knowledge of local languages (Assamese/Bodo/Khasi etc.) desirable.",
      workResponsibilities: "1. Support agri-business development projects in NE states\n2. Conduct baseline surveys and need assessments for FPOs\n3. Facilitate market linkages for agricultural produce\n4. Organize farmer training programs and capacity building workshops\n5. Prepare project reports and progress documentation",
      termsAndConditions: "Posted at Guwahati Regional Directorate. Extensive travel in NE states required. Purely contractual.",
      applicationDeadline: new Date("2026-05-31"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/CHD/2026/001",
      title: "Senior Consultant - Industrial Engineering (Lean Manufacturing)",
      functionalRole: "senior_consultant",
      domain: "IE",
      engagementType: "lump_sum",
      numberOfPositions: 2,
      placeOfDeployment: "CHD",
      minQualification: "B.Tech/B.E. in Mechanical/Industrial/Production Engineering from a recognized university",
      minExperienceYears: 12,
      maxAgeLimitYears: 62,
      remunerationRange: "Lump sum as per project (Rs. 3,00,000 - Rs. 8,00,000 per assignment)",
      contractPeriod: "Project-based (3-6 months per assignment)",
      eligibilityCriteria: "B.Tech/B.E. in Mechanical/Industrial/Production Engineering with minimum 12 years experience in lean manufacturing, Six Sigma, TPM, or industrial productivity improvement. Six Sigma Black Belt certification mandatory. Experience with MSME cluster development programs preferred. Should have completed at least 8 industrial consultancy assignments.",
      workResponsibilities: "1. Conduct lean manufacturing assessments in MSME clusters\n2. Implement Six Sigma and Kaizen projects in manufacturing units\n3. Design and deliver productivity improvement training programs\n4. Prepare detailed project reports with ROI analysis\n5. Support NPC's National Productivity Drive initiatives",
      termsAndConditions: "Lump-sum project-based engagement. Posted at Chandigarh Regional Directorate. Travel to industrial units required.",
      applicationDeadline: new Date("2026-06-10"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/HQ/2026/004",
      title: "Resource Person - Training & Capacity Building (Administration)",
      functionalRole: "resource_person",
      domain: "ADM",
      engagementType: "resource_person",
      numberOfPositions: 5,
      placeOfDeployment: "HQ",
      minQualification: "Graduate in any discipline with training/facilitation certification",
      minExperienceYears: 5,
      maxAgeLimitYears: 65,
      remunerationRange: "Rs. 3,000 - Rs. 7,500/session (2 hours) based on category",
      contractPeriod: "Panel empanelment for 2 years",
      eligibilityCriteria: "Graduate with minimum 5 years experience in training delivery and capacity building. Certification in training/facilitation (ToT, ISTD, ATD etc.) preferred. Experience in conducting programs for government officials on topics like office management, file management, RTI, e-Office, noting & drafting. Retired Group A/B officers with training experience preferred.",
      workResponsibilities: "1. Conduct training sessions on administrative procedures for government officials\n2. Develop training modules on e-Office, file management, RTI compliance\n3. Facilitate workshops on noting, drafting, and office procedures\n4. Prepare training materials and handouts\n5. Evaluate training effectiveness and submit session reports",
      termsAndConditions: "Session-based engagement. No minimum sessions guaranteed. Resource persons to be available as per NPC's training calendar.",
      applicationDeadline: new Date("2026-06-30"),
      createdBy: admin.id,
    },
  ];

  for (const post of posts) {
    const existing = await prisma.postRequirement.findUnique({
      where: { advertisementNo: post.advertisementNo },
    });
    if (existing) {
      console.log(`Skipping (exists): ${post.advertisementNo}`);
      continue;
    }
    await prisma.postRequirement.create({ data: post });
    console.log(`Created: ${post.advertisementNo} — ${post.title} [${post.placeOfDeployment}]`);
  }

  console.log("\nDone! 8 new test posts created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
