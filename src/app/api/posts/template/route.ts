import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const headers = [
    "Advertisement No",
    "Post Code",
    "Title",
    "Functional Role",
    "Domain",
    "Group/Division Name",
    "Engagement Type",
    "Number of Positions",
    "Place of Deployment",
    "Min Qualification",
    "Desired Qualification",
    "Professional Certification",
    "Min Experience Years",
    "Experience Description",
    "Preferred Experience",
    "Max Age Limit",
    "Age Relaxation",
    "Remuneration Range",
    "Contract Period",
    "Eligibility Criteria",
    "Work Responsibilities",
    "Terms and Conditions",
    "Application Instructions",
    "Annexure Form Reference",
    "Application Deadline",
  ];

  const exampleRow = [
    "NPC/HQ/2026/999",
    "Adv/01",
    "Consultant - Example Domain",
    "consultant",
    "IT",
    "HRM Group at NPC, HQ",
    "full_time",
    2,
    "HQ",
    "Graduate in relevant discipline from recognized university",
    "Master's degree preferred",
    "Six Sigma Black Belt",
    6,
    "Expertise in statistical system management...",
    "ISS cadre Level-14 & above preferred",
    65,
    "As per GoI norms for SC/ST/OBC/PwD",
    "Rs. 75,000/month",
    "1 year (extendable)",
    "Detailed eligibility criteria here",
    "1. Responsibility one\n2. Responsibility two",
    "Purely contractual engagement.",
    "Submit via portal with self-attested documents",
    "Annex-AF",
    "2026-06-30",
  ];

  // Instruction rows
  const instructions = [
    "--- INSTRUCTIONS (delete these rows before uploading) ---",
    "Functional Role: advisor | senior_consultant | consultant | project_associate | project_executive | young_professional | resource_person",
    "Domain: AB | ES | ECA | EM | HRM | IE | IT | FIN | ADM | ID | IS",
    "Engagement Type: full_time | part_time | lump_sum | revenue_sharing | resource_person",
    "Place of Deployment: HQ | BLR | BBS | CHD | CHN | GN | GHY | HYD | JAI | KNP | KOL | MUM | PAT",
    "Application Deadline: YYYY-MM-DD format",
    "Post Code: Optional - e.g. Adv/01",
    "Group/Division Name: Optional - e.g. HRM Group at NPC, HQ, New Delhi",
    "Desired Qualification: Optional - preferred additional qualifications",
    "Professional Certification: Optional - e.g. Six Sigma Black Belt, CA",
    "Experience Description: Optional - detailed description of required experience",
    "Preferred Experience: Optional - additional preferred experience",
    "Age Relaxation: Optional - e.g. As per GoI norms for SC/ST/OBC/PwD",
    "Application Instructions: Optional - how to apply, documents needed",
    "Annexure Form Reference: Optional - e.g. Annex-AF",
    "--- END INSTRUCTIONS ---",
  ];

  const wb = XLSX.utils.book_new();
  const wsData = [
    headers,
    exampleRow,
    [], // empty row separator
    ...instructions.map((text) => [text]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 5, 20) }));

  XLSX.utils.book_append_sheet(wb, ws, "Post Requirements");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="NPC_Post_Requirements_Template.xlsx"',
    },
  });
}
