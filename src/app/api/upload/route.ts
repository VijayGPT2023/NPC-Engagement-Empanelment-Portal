import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSessionFromRequest } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;
    const documentName = formData.get("documentName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds maximum limit of 5MB" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Accepted types: JPEG, PNG, PDF, DOC, DOCX`,
        },
        { status: 400 }
      );
    }

    // Create upload directory structure: uploads/{userId}/{documentType}/
    const userUploadDir = path.join(UPLOAD_DIR, session.userId, documentType);
    await mkdir(userUploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name) || `.${file.type.split("/").pop()}`;
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(ext, "");
    const fileName = `${sanitizedName}_${timestamp}${ext}`;
    const filePath = path.join(userUploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return relative path for storage in DB
    const relativePath = path
      .relative(process.cwd(), filePath)
      .replace(/\\/g, "/");

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        file: {
          fileName,
          originalName: file.name,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.type,
          documentType,
          documentName: documentName || file.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
