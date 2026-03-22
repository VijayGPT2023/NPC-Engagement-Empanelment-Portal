import fs from "fs/promises";
import path from "path";

export type StorageType = "local" | "minio";

function getStorageType(): StorageType {
  return (process.env.STORAGE_TYPE as StorageType) || "local";
}

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

export async function saveFile(relativePath: string, buffer: Buffer): Promise<string> {
  const storageType = getStorageType();

  if (storageType === "minio") {
    return saveToMinIO(relativePath, buffer);
  }
  return saveToLocal(relativePath, buffer);
}

export async function getFileUrl(relativePath: string): Promise<string> {
  const storageType = getStorageType();

  if (storageType === "minio") {
    return getMinIOUrl(relativePath);
  }
  return `/uploads/${relativePath}`;
}

export async function deleteFile(relativePath: string): Promise<void> {
  const storageType = getStorageType();

  if (storageType === "minio") {
    return deleteFromMinIO(relativePath);
  }
  return deleteFromLocal(relativePath);
}

// --- Local filesystem ---

async function saveToLocal(relativePath: string, buffer: Buffer): Promise<string> {
  const fullPath = path.join(getUploadDir(), relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  return relativePath;
}

async function deleteFromLocal(relativePath: string): Promise<void> {
  const fullPath = path.join(getUploadDir(), relativePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // File may not exist
  }
}

// --- MinIO (S3-compatible) ---

async function saveToMinIO(relativePath: string, buffer: Buffer): Promise<string> {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET || "npc-portal";

  if (!endpoint || !accessKey || !secretKey) {
    console.error("[Storage] MinIO not configured, falling back to local");
    return saveToLocal(relativePath, buffer);
  }

  // Dynamic import to avoid requiring minio package when using local storage
  try {
    const { Client } = await import("minio");
    const client = new Client({
      endPoint: endpoint,
      port: parseInt(process.env.MINIO_PORT || "9000", 10),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey,
      secretKey,
    });

    // Ensure bucket exists
    const exists = await client.bucketExists(bucket);
    if (!exists) {
      await client.makeBucket(bucket, "ap-south-1");
    }

    await client.putObject(bucket, relativePath, buffer, buffer.length);
    return relativePath;
  } catch (error) {
    console.error("[Storage] MinIO upload failed, falling back to local:", error);
    return saveToLocal(relativePath, buffer);
  }
}

async function getMinIOUrl(relativePath: string): Promise<string> {
  const endpoint = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET || "npc-portal";
  const port = process.env.MINIO_PORT || "9000";
  const ssl = process.env.MINIO_USE_SSL === "true";

  return `${ssl ? "https" : "http"}://${endpoint}:${port}/${bucket}/${relativePath}`;
}

async function deleteFromMinIO(relativePath: string): Promise<void> {
  try {
    const endpoint = process.env.MINIO_ENDPOINT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const bucket = process.env.MINIO_BUCKET || "npc-portal";

    if (!endpoint || !accessKey || !secretKey) return;

    const { Client } = await import("minio");
    const client = new Client({
      endPoint: endpoint,
      port: parseInt(process.env.MINIO_PORT || "9000", 10),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey,
      secretKey,
    });

    await client.removeObject(bucket, relativePath);
  } catch {
    // Ignore deletion failures
  }
}
