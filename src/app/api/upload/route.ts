import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSessionFromRequest } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

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

const ALLOWED_DOCUMENT_TYPES = [
  "photo",
  "aadhaar",
  "dob_proof",
  "qualification",
  "experience",
  "ppo",
  "cv",
  "other",
  "retirement",
  "signature",
];

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

// Magic byte signatures for file type validation
const MAGIC_BYTES: Record<string, number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  ".jpg": [0xff, 0xd8],              // JPEG SOI
  ".jpeg": [0xff, 0xd8],             // JPEG SOI
  ".png": [0x89, 0x50, 0x4e, 0x47],  // PNG header
  ".doc": [0xd0, 0xcf, 0x11, 0xe0],  // OLE compound document
  ".docx": [0x50, 0x4b],             // ZIP (PK) — DOCX is a ZIP archive
};

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
  const expected = MAGIC_BYTES[ext.toLowerCase()];
  if (!expected) return true; // No magic bytes to check for this extension
  if (buffer.length < expected.length) return false;
  return expected.every((byte, i) => buffer[i] === byte);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { success } = checkRateLimit(`upload:${ip}`, RATE_LIMITS.upload);
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

    // Validate documentType against whitelist
    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json(
        {
          error: `Invalid document type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(", ")}`,
        },
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

    // Sanitize original filename: remove path separators and dangerous characters
    const sanitizedOriginalName = file.name
      .replace(/[/\\:*?"<>|]/g, "_")
      .replace(/\.\./g, "_");

    // Validate file extension
    const ext = path.extname(sanitizedOriginalName).toLowerCase() || `.${file.type.split("/").pop()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error: `File extension not allowed. Accepted extensions: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Read file bytes for magic byte validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes to prevent MIME spoofing
    if (!validateMagicBytes(buffer, ext)) {
      return NextResponse.json(
        {
          error: "File content does not match the declared file type. Possible MIME spoofing detected.",
        },
        { status: 400 }
      );
    }

    // Create upload directory structure: uploads/{userId}/{documentType}/
    const userUploadDir = path.join(UPLOAD_DIR, session.userId, documentType);
    await mkdir(userUploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizedOriginalName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(ext, "");
    const fileName = `${sanitizedName}_${timestamp}${ext}`;
    const filePath = path.join(userUploadDir, fileName);

    // Write file to disk
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
          originalName: sanitizedOriginalName,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.type,
          documentType,
          documentName: documentName || sanitizedOriginalName,
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
