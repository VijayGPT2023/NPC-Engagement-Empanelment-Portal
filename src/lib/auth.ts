import bcrypt from "bcryptjs";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "npc-portal-secret-key-change-in-production";
const TOKEN_EXPIRY_HOURS = 24;

// ─── Password Helpers ──────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Token Helpers ─────────────────────────────────────────────

interface TokenPayload {
  userId: string;
  role: string;
  exp: number;
}

export function generateToken(userId: string, role: string): string {
  const payload: TokenPayload = {
    userId,
    role,
    exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  };
  const json = JSON.stringify(payload);
  // Simple base64 encoding with a signature suffix for tamper detection
  const data = Buffer.from(json).toString("base64url");
  const signature = Buffer.from(
    simpleHmac(data, TOKEN_SECRET)
  ).toString("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    // Verify signature
    const expectedSig = Buffer.from(
      simpleHmac(data, TOKEN_SECRET)
    ).toString("base64url");
    if (signature !== expectedSig) return null;

    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload: TokenPayload = JSON.parse(json);

    // Check expiry
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

// Simple HMAC-like function using built-in crypto
function simpleHmac(data: string, secret: string): string {
  // Use Node crypto for HMAC
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

// ─── Session from Request ──────────────────────────────────────

export interface Session {
  userId: string;
  role: string;
}

export function getSessionFromRequest(request: Request): Session | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    const payload = verifyToken(token);
    if (payload) {
      return { userId: payload.userId, role: payload.role };
    }
  }

  // Try cookie
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...rest] = c.trim().split("=");
        return [key, rest.join("=")];
      })
    );
    const token = cookies["npc-token"];
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        return { userId: payload.userId, role: payload.role };
      }
    }
  }

  return null;
}
