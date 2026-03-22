import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("ERROR: Seed script must not run in production. Set NODE_ENV appropriately.");
    process.exit(1);
  }

  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@npcindia.gov.in" },
    update: {},
    create: {
      email: "admin@npcindia.gov.in",
      password: hashSync("admin123", 10),
      name: "NPC Admin",
      role: "admin",
      office: "HQ",
    },
  });
  console.log("Created admin:", admin.email);

  // Create DG user
  const dg = await prisma.user.upsert({
    where: { email: "dg@npcindia.gov.in" },
    update: {},
    create: {
      email: "dg@npcindia.gov.in",
      password: hashSync("dg123456", 10),
      name: "Director General",
      role: "dg",
      office: "HQ",
    },
  });
  console.log("Created DG:", dg.email);

  // Create screening committee user
  const screener = await prisma.user.upsert({
    where: { email: "screening@npcindia.gov.in" },
    update: {},
    create: {
      email: "screening@npcindia.gov.in",
      password: hashSync("screen123", 10),
      name: "Screening Committee Member",
      role: "screening_committee",
      office: "HQ",
    },
  });
  console.log("Created screener:", screener.email);

  // Create sample applicant
  const applicant = await prisma.user.upsert({
    where: { email: "applicant@example.com" },
    update: {},
    create: {
      email: "applicant@example.com",
      password: hashSync("test1234", 10),
      name: "Sample Applicant",
      role: "applicant",
    },
  });
  console.log("Created applicant:", applicant.email);

  // Create sample post requirements
  const posts = [
    {
      advertisementNo: "NPC/HQ/2026/001",
      title: "Senior Consultant - Information Technology",
      functionalRole: "senior_consultant",
      domain: "IT",
      engagementType: "full_time",
      numberOfPositions: 2,
      placeOfDeployment: "HQ",
      minQualification: "Graduate in any discipline from a government recognized university/institution relevant to the work requirement",
      minExperienceYears: 10,
      maxAgeLimitYears: 65,
      remunerationRange: "Rs. 90,000/month (Fixed) or Rs. 6,000/day",
      contractPeriod: "1 year (extendable)",
      eligibilityCriteria: "Graduate in Computer Science/IT or related discipline from a govt recognized university with minimum 10 years of relevant experience. Experience in government projects preferred. Knowledge of e-Governance, cloud computing, cybersecurity desired.",
      workResponsibilities: "1. Lead IT consultancy projects for government clients\n2. Design and implement IT solutions\n3. Provide technical guidance to project teams\n4. Prepare project reports and documentation\n5. Coordinate with client organizations",
      termsAndConditions: "The engagement shall be purely on a contract basis and will not confer any right for regular appointment in NPC or in its associated organizations.",
      applicationDeadline: new Date("2026-04-30"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/HQ/2026/002",
      title: "Project Executive - Agri Business",
      functionalRole: "project_executive",
      domain: "AB",
      engagementType: "full_time",
      numberOfPositions: 3,
      placeOfDeployment: "HQ",
      minQualification: "Graduate degree in relevant discipline from recognized university/institution",
      minExperienceYears: 2,
      maxAgeLimitYears: null,
      remunerationRange: "Rs. 28,000 - Rs. 65,000/month based on experience",
      contractPeriod: "1 year (extendable)",
      eligibilityCriteria: "Graduate in Agriculture, Food Technology, Rural Development or related discipline. Minimum 2 years experience in agricultural consultancy or research.",
      workResponsibilities: "1. Support agri-business consultancy projects\n2. Conduct field visits and data collection\n3. Prepare analytical reports\n4. Coordinate with stakeholders",
      termsAndConditions: "The engagement shall be purely on a contract basis.",
      applicationDeadline: new Date("2026-05-15"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/BLR/2026/001",
      title: "Consultant - Energy Management",
      functionalRole: "consultant",
      domain: "EM",
      engagementType: "full_time",
      numberOfPositions: 1,
      placeOfDeployment: "BLR",
      minQualification: "Graduate in any discipline from a government recognized university/institution",
      minExperienceYears: 6,
      maxAgeLimitYears: 65,
      remunerationRange: "Rs. 75,000/month (Fixed) or Rs. 5,000/day",
      contractPeriod: "1 year",
      eligibilityCriteria: "Graduate in Electrical/Mechanical Engineering or Energy Management. Minimum 6 years experience in energy audit, renewable energy, or related fields. BEE certified energy auditor preferred.",
      workResponsibilities: "1. Conduct energy audits for industrial units\n2. Prepare energy conservation recommendations\n3. Support energy management training programs\n4. Develop energy efficiency reports",
      termsAndConditions: "The engagement shall be purely on a contract basis.",
      applicationDeadline: new Date("2026-04-20"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/CHN/2026/001",
      title: "Young Professional - Environment & Climate Action",
      functionalRole: "young_professional",
      domain: "ECA",
      engagementType: "full_time",
      numberOfPositions: 2,
      placeOfDeployment: "CHN",
      minQualification: "Professional degree from reputed institute (ISI, IIT, etc.)",
      minExperienceYears: 0,
      maxAgeLimitYears: 35,
      remunerationRange: "Rs. 60,000/month",
      contractPeriod: "Up to 3 years",
      eligibilityCriteria: "Professional degree in Environmental Science, Climate Science, or related field from a reputed institute. Maximum age 35 years. Fresh graduates or candidates with up to 1 year experience.",
      workResponsibilities: "1. Support environmental consultancy projects\n2. Conduct environmental impact assessments\n3. Support climate action initiatives\n4. Prepare analytical reports",
      termsAndConditions: "Maximum tenure of 3 years. The engagement shall be purely on a contract basis.",
      applicationDeadline: new Date("2026-05-31"),
      createdBy: admin.id,
    },
    {
      advertisementNo: "NPC/MUM/2026/001",
      title: "Advisor - Industrial Engineering",
      functionalRole: "advisor",
      domain: "IE",
      engagementType: "full_time",
      numberOfPositions: 1,
      placeOfDeployment: "MUM",
      minQualification: "Graduate in any discipline from a government recognized university/institution",
      minExperienceYears: 20,
      maxAgeLimitYears: 65,
      remunerationRange: "Rs. 1,25,000/month (Fixed) or Rs. 10,000/day",
      contractPeriod: "1 year (extendable)",
      eligibilityCriteria: "Graduate/Post-graduate in Industrial Engineering, Manufacturing, or related discipline. Minimum 20 years experience in productivity improvement, lean manufacturing, or industrial engineering consultancy. Experience with government/PSU clients preferred.",
      workResponsibilities: "1. Lead industrial engineering consultancy projects\n2. Provide strategic advisory on productivity improvement\n3. Conduct training programs for industry\n4. Mentor junior consultants\n5. Prepare policy recommendations",
      termsAndConditions: "The engagement shall be purely on a contract basis.",
      applicationDeadline: new Date("2026-04-25"),
      createdBy: admin.id,
    },
  ];

  for (const post of posts) {
    await prisma.postRequirement.upsert({
      where: { advertisementNo: post.advertisementNo },
      update: {},
      create: post,
    });
    console.log("Created post:", post.advertisementNo, post.title);
  }

  console.log("\nSeed completed! Use these credentials to login:");
  console.log("Admin:     admin@npcindia.gov.in / admin123");
  console.log("DG:        dg@npcindia.gov.in / dg123456");
  console.log("Screener:  screening@npcindia.gov.in / screen123");
  console.log("Applicant: applicant@example.com / test1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
