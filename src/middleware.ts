import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Log slow requests (handled by response timing)
  const start = Date.now();

  // JSON body size limit — reject requests with Content-Length > 1MB (1048576 bytes)
  const contentLength = parseInt(
    request.headers.get("content-length") || "0",
    10
  );
  if (
    contentLength > 1_048_576 &&
    !request.nextUrl.pathname.startsWith("/api/upload")
  ) {
    return NextResponse.json(
      { error: "Request body too large. Maximum 1MB allowed." },
      { status: 413 }
    );
  }

  // Add request ID header for tracing
  const requestId = crypto.randomUUID();
  response.headers.set("X-Request-Id", requestId);

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
