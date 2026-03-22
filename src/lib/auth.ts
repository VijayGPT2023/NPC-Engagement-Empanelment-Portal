import bcrypt from "bcryptjs";

// ─── Secret Resolution ───────────────────────────────────────
// Deferred check: validates at first request, not at import/build time

let _secretValidated = false;

function getTokenSecret(): string {
  const secret = process.env.TOKEN_SECRET || process.env.NEXTAUTH_SECRET;

  if (!_secretValidated) {
    _secretValidated = true;

    if (!process.env.NODE_ENV) {
      console.warn(
        "WARNING: NODE_ENV is not set. Defaulting to development behavior. Set NODE_ENV explicitly in production."
      );
    }

    if (process.env.NODE_ENV === "production") {
      if (!secret || secret.includes("change-in-production")) {
        console.error(
          "FATAL: TOKEN_SECRET or NEXTAUTH_SECRET must be set to a strong, unique value in production. Exiting."
        );
        process.exit(1);
      }
    }
  }

  return secret || "npc-portal-dev-only-secret-do-not-use-in-prod";
}

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
    simpleHmac(data, getTokenSecret())
  ).toString("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    // Verify signature
    const expectedSig = Buffer.from(
      simpleHmac(data, getTokenSecret())
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
