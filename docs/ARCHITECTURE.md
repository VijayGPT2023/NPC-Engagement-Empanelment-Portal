# Software Architecture Document
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

---

## 1. Architecture Pattern

### Monolithic Next.js Application (App Router)

The portal is a single Next.js 14+ application that serves both the frontend (React with server-side rendering and client-side hydration) and the backend (API routes) from one deployment unit.

```
┌───────────────────────────────────────────────────────┐
│                   Next.js Application                  │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Frontend    │  │  API Routes  │  │  Middleware   ││
│  │  (React SSR   │  │  (16 REST    │  │  (Rate limit, ││
│  │   + CSR)      │  │   endpoints) │  │   body size)  ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Prisma ORM  │  │  Cron Tasks  │  │    i18n      ││
│  │  (20 models)  │  │  (setInterval)│  │  (EN + HI)  ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└────────┬──────────────┬──────────────┬────────────────┘
         │              │              │
    ┌────▼────┐   ┌─────▼────┐   ┌────▼───────────┐
    │PostgreSQL│   │  Redis   │   │ Local FS/MinIO │
    │  (Data)  │   │ (Cache)  │   │   (Files)      │
    └─────────┘   └──────────┘   └────────────────┘
```

### Why Monolithic (not Microservices)

| Factor | Decision |
|--------|----------|
| **Deployment target** | Single government VM (NICSI) -- no Kubernetes or container orchestration available |
| **Team size** | Small team; one deployment unit reduces operational overhead |
| **Complexity** | Application is a standard CRUD portal with screening logic -- no need for independent scaling of components |
| **Inter-service communication** | Zero network hops; function calls are faster and simpler than HTTP/gRPC between services |
| **Data consistency** | Single database, single transaction context; no distributed transaction complexity |
| **Railway staging** | Free tier supports one service easily; multiple services would require paid plans |
| **Future migration** | API routes are already isolated by concern -- extracting into microservices later is straightforward if needed |

---

## 2. Request Lifecycle

```
┌──────────┐
│  Client   │  Browser / curl / mobile
│  (HTTPS)  │
└─────┬─────┘
      │
      ▼
┌─────────────────┐
│  Reverse Proxy   │  Nginx (NICSI) or Railway edge
│  - SSL terminate │
│  - Compress      │
│  - Rate limit    │
│    (optional)    │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  Next.js Middleware (src/middleware.ts)                      │
│  Runs on: /api/:path*                                       │
│                                                             │
│  1. Check Content-Length header                              │
│     - If > 1MB AND not /api/upload → 413 Payload Too Large  │
│  2. Generate X-Request-Id (crypto.randomUUID())              │
│  3. Attach X-Request-Id to response headers                  │
│  4. Pass to NextResponse.next()                              │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Route Handler (src/app/api/.../route.ts)                   │
│                                                             │
│  1. Rate limit check (in-memory, per-endpoint config)       │
│     - Extract IP from x-forwarded-for / x-real-ip           │
│     - If limit exceeded → 429 Too Many Requests             │
│                                                             │
│  2. Authentication (for protected routes)                    │
│     - getSessionFromRequest(request)                        │
│     - Check Authorization: Bearer header → cookie fallback  │
│     - Verify HMAC-SHA256 token signature + expiry            │
│     - If invalid → 401 Unauthorized                         │
│                                                             │
│  3. Authorization (role check)                               │
│     - Compare session.role against allowed roles             │
│     - If insufficient → 403 Forbidden                       │
│                                                             │
│  4. Request validation                                      │
│     - Parse JSON body or FormData                           │
│     - Validate required fields, formats, business rules      │
│     - If invalid → 400 Bad Request                          │
│                                                             │
│  5. Business logic                                          │
│     - Prisma queries (with transactions where needed)        │
│     - Cache read/write (getCached / setCache)               │
│     - File operations (saveFile for uploads)                │
│     - Screening engine (for /api/screening)                  │
│                                                             │
│  6. Response                                                │
│     - JSON response with appropriate status code             │
│     - Or file download (CSV, XLSX)                          │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Caching Strategy

### In-Memory Cache (`src/lib/cache.ts`)

The application uses a simple in-memory `Map<string, CacheEntry>` for caching. No external cache (Redis) is used at runtime currently, though the architecture supports adding Redis when `REDIS_URL` is set.

| Cache Key Pattern | TTL | Description |
|-------------------|-----|-------------|
| `posts:{status}:{domain}:{type}:{page}:{limit}` | 5 min (default) | Public post listing results |
| `admin:stats` | 2 min | Admin dashboard statistics |

### Cache Operations

| Function | Behavior |
|----------|----------|
| `getCached<T>(key)` | Returns data if exists and not expired; deletes expired entries on access |
| `setCache<T>(key, data, ttlMs)` | Stores with expiry timestamp; default TTL = 5 minutes |
| `invalidateCache(pattern)` | Prefix-match deletion; called when posts are created/updated |

### Cleanup

A `setInterval` runs every 10 minutes to sweep expired entries from the cache map.

### Cache Invalidation Points

- `POST /api/posts` (create post) → `invalidateCache("posts:")`
- Post mutations auto-expire after TTL
- Stats cache expires after 2 minutes (near real-time for admin dashboard)

---

## 4. Authentication Architecture

### Token Format: Custom HMAC-SHA256

Instead of using a JWT library, the system implements a minimal token format:

```
Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature)

Payload: { userId: string, role: string, exp: number }
```

### Why No JWT Library

1. **Zero dependency** -- uses only Node.js built-in `crypto` module
2. **Simpler** -- no need for `jsonwebtoken` or `jose` packages
3. **Sufficient** -- the portal does not need JWT features like `iss`, `aud`, `nbf`, or RS256/ES256 signing
4. **Government compliance** -- fewer dependencies means smaller attack surface for security audit

### Secret Management

```
TOKEN_SECRET (or NEXTAUTH_SECRET alias)
    │
    ├── Production: MUST be set to a strong, unique value (min 32 chars)
    │   Missing/weak value → process.exit(1) on first request
    │
    └── Development: Falls back to hardcoded dev-only secret
        "npc-portal-dev-only-secret-do-not-use-in-prod"
```

Secret validation is deferred to first request (not import time) to avoid breaking the build process.

### Token Delivery

- **Response body**: Token returned in JSON for client-side storage
- **HTTP-only cookie**: `npc-token` cookie set simultaneously
  - `httpOnly: true` (not accessible via JavaScript)
  - `secure: true` in production (HTTPS only)
  - `sameSite: "lax"` (CSRF protection)
  - `maxAge: 86400` (24 hours)
- **Request verification**: Checks `Authorization: Bearer` header first, then falls back to cookie

---

## 5. File Storage Architecture

### Dual-Mode Storage (`src/lib/storage.ts`)

The storage layer is switchable between local filesystem and MinIO (S3-compatible) via environment variable.

```
STORAGE_TYPE=local (default)     STORAGE_TYPE=minio
        │                               │
        ▼                               ▼
┌───────────────┐              ┌─────────────────┐
│  Local FS     │              │  MinIO (S3)     │
│               │              │                  │
│  uploads/     │              │  Bucket:         │
│  └─{userId}/  │              │  npc-portal/     │
│    └─{type}/  │              │  └─{relativePath}│
│      └─file   │              │                  │
└───────────────┘              └─────────────────┘
```

### Storage Functions

| Function | Behavior |
|----------|----------|
| `saveFile(relativePath, buffer)` | Saves to local or MinIO based on STORAGE_TYPE. MinIO falls back to local on error. |
| `getFileUrl(relativePath)` | Returns `/uploads/{path}` for local, or `http(s)://{endpoint}:{port}/{bucket}/{path}` for MinIO |
| `deleteFile(relativePath)` | Removes from local FS or MinIO. Silently ignores missing files. |

### MinIO Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| MINIO_ENDPOINT | -- | MinIO server hostname |
| MINIO_PORT | 9000 | MinIO port |
| MINIO_USE_SSL | false | Use HTTPS |
| MINIO_ACCESS_KEY | -- | Access key |
| MINIO_SECRET_KEY | -- | Secret key |
| MINIO_BUCKET | npc-portal | Bucket name (auto-created if missing) |

### Upload Route (`POST /api/upload`)

The upload route handles file validation independently from the storage layer:
- Max file size: 5MB
- Allowed MIME types: JPEG, PNG, PDF, DOC, DOCX
- Magic byte validation prevents MIME spoofing
- Files saved to: `uploads/{userId}/{documentType}/{sanitized}_{timestamp}{ext}`

---

## 6. Internationalization Architecture

### Zustand + JSON Files

```
src/i18n/
├── index.ts      # Zustand store + useTranslation hook
├── en.json       # English translations
└── hi.json       # Hindi translations
```

### Architecture

1. **Zustand store** (`useLanguageStore`) persists locale to `localStorage` key `npc-language`
2. **Translation files** are static JSON objects imported at build time (no runtime fetching)
3. **`useTranslation()` hook** returns `{ t, locale }` where `t("section.key")` resolves dot-notation paths
4. **`getTranslation(locale)` function** provides server-side (non-hook) access
5. **`LanguageSwitcher` component** renders a toggle button, calling `setLocale()`

### Key Design Choices

- Client-side only (no server-side locale negotiation or URL-based locale routing)
- Dot-notation key access with fallback to key string if translation missing
- No pluralization or interpolation library -- simple string lookup

---

## 7. Security Layers

Requests pass through multiple security layers in order:

```
1. Reverse Proxy (Nginx)
   └── SSL/TLS termination
   └── Connection limits
   └── Request size limits

2. Next.js Middleware (src/middleware.ts)
   └── Body size limit: 1MB for non-upload routes
   └── Request ID generation for tracing

3. Rate Limiting (in route handlers)
   └── Per-endpoint limits (5-60 req/min)
   └── IP-based identification
   └── In-memory store with auto-cleanup

4. Authentication (in route handlers)
   └── HMAC-SHA256 token verification
   └── 24-hour expiry check
   └── Cookie + Bearer header support

5. Authorization (in route handlers)
   └── Role-based access control
   └── Resource ownership checks (applicants see only own data)

6. Input Validation (in route handlers)
   └── Required field checks
   └── Email format validation
   └── Password strength rules
   └── Business rule validation (deadline not passed, post is active, etc.)

7. File Upload Security (POST /api/upload)
   └── MIME type whitelist
   └── Extension whitelist
   └── Magic byte validation (anti-MIME-spoofing)
   └── Filename sanitization (strip path traversal chars)
   └── 5MB size limit

8. Database Layer
   └── Prisma parameterized queries (SQL injection prevention)
   └── Unique constraints (duplicate prevention)
   └── Foreign key constraints (referential integrity)
   └── Cascade deletes on child records
```

---

## 8. Scheduled Tasks Architecture

### Next.js Instrumentation API

The application uses Next.js `instrumentation.ts` to initialize background tasks when the Node.js runtime starts.

```
src/instrumentation.ts
    │
    │  Exports register() function
    │  Called once when Next.js server starts
    │  Only runs in NEXT_RUNTIME === "nodejs" (not Edge)
    │
    └──► src/lib/cron.ts → initScheduledTasks()
              │
              │  Sets initialized = true (idempotent)
              │  Creates setInterval (every 1 hour)
              │
              └──► At midnight (hour === 0):
                    │
                    ├── cleanupExpiredTokens()
                    │   Delete read notifications older than 30 days
                    │
                    ├── checkDocumentExpiry()
                    │   Find certifications expiring in 30 days
                    │   Create notification for each affected user
                    │
                    └── closeExpiredPosts()
                        Set status = "closed" for active posts
                        past applicationDeadline
```

### Why setInterval (not node-cron or external scheduler)

- **Zero dependencies** -- no additional packages needed
- **Single process** -- government VM runs one instance, no distributed scheduling needed
- **Simplicity** -- three simple tasks that run daily; no complex scheduling requirements
- **Resilience** -- if the process restarts, tasks reinitialize automatically

---

## 9. Error Handling Strategy

### API Route Error Handling

Every route handler follows this pattern:

```typescript
export async function METHOD(request: NextRequest) {
  try {
    // ... validation, business logic ...
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Context-specific message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Error Response Format

All error responses follow a consistent shape:

```json
{ "error": "Human-readable error message" }
```

### HTTP Status Code Usage

| Status | Meaning | Used When |
|--------|---------|-----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Missing fields, invalid format, business rule violation |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient role |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate (email, advertisement no, application) |
| 413 | Payload Too Large | Body > 1MB (middleware) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled exception |
| 503 | Service Unavailable | Database down (health check), webhook not configured |

### Prisma Error Handling

Specific Prisma errors are caught where meaningful:
- `P2002` (unique constraint violation) → 409 Conflict with user-friendly message

---

## 10. Logging Strategy

### Structured JSON to stdout (`src/lib/logger.ts`)

```json
{
  "timestamp": "2026-03-19T10:30:00.000Z",
  "level": "info",
  "message": "Description of event",
  "requestId": "uuid",
  "userId": "uuid",
  "ip": "1.2.3.4",
  "path": "/api/posts",
  "method": "GET",
  "statusCode": 200,
  "durationMs": 45
}
```

### Log Levels

| Level | Output | Usage |
|-------|--------|-------|
| info | `console.log` | Normal operations: task completion, webhook received |
| warn | `console.warn` | Slow requests (>2s), missing config, failed webhook signature |
| error | `console.error` | Unhandled exceptions, task failures |

### Slow Request Detection

`logSlowRequest(path, method, durationMs, threshold=2000)` logs a warning when any request takes longer than 2 seconds.

### Log Collection (Production)

Logs written to stdout are collected by:
- **Railway**: Built-in log streaming in Railway dashboard
- **NICSI VM**: Docker logs → collected via `docker logs` or forwarded to ELK/Grafana Loki

---

## 11. Environment-Based Configuration

All configuration is driven by environment variables. No config files, no hardcoded values in business logic.

### Complete Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| **NODE_ENV** | Yes | -- | `production` or `development` |
| **PORT** | No | 3000 | Server port |
| **DATABASE_URL** | Yes | -- | PostgreSQL connection string |
| **TOKEN_SECRET** | Yes (prod) | dev fallback | HMAC signing key (min 32 chars) |
| **NEXTAUTH_SECRET** | No | -- | Alias for TOKEN_SECRET |
| **NEXTAUTH_URL** | No | -- | Base URL of the application |
| **SMTP_HOST** | No | -- | SMTP server hostname |
| **SMTP_PORT** | No | 587 | SMTP port |
| **SMTP_SECURE** | No | false | Use TLS for SMTP |
| **SMTP_USER** | No | -- | SMTP username |
| **SMTP_PASS** | No | -- | SMTP password |
| **SMTP_FROM** | No | noreply@npcindia.gov.in | From email address |
| **SMS_PROVIDER** | No | console | msg91, nic_gateway, or console |
| **MSG91_AUTH_KEY** | No | -- | MSG91 authentication key |
| **MSG91_SENDER_ID** | No | NPCIND | MSG91 sender ID |
| **MSG91_ROUTE** | No | 4 | MSG91 route (4=transactional) |
| **NIC_SMS_API_URL** | No | -- | NIC SMS Gateway URL |
| **NIC_SMS_USERNAME** | No | -- | NIC SMS username |
| **NIC_SMS_PASSWORD** | No | -- | NIC SMS password |
| **NIC_SMS_SENDER_ID** | No | NPCIND | NIC SMS sender ID |
| **STORAGE_TYPE** | No | local | `local` or `minio` |
| **UPLOAD_DIR** | No | ./uploads | Local upload directory |
| **MINIO_ENDPOINT** | No | -- | MinIO server hostname |
| **MINIO_PORT** | No | 9000 | MinIO port |
| **MINIO_USE_SSL** | No | false | MinIO SSL |
| **MINIO_ACCESS_KEY** | No | -- | MinIO access key |
| **MINIO_SECRET_KEY** | No | -- | MinIO secret key |
| **MINIO_BUCKET** | No | npc-portal | MinIO bucket name |
| **REDIS_URL** | No | -- | Redis connection string (reserved) |
| **APP_URL** | No | -- | Public-facing URL |
| **CORS_ORIGINS** | No | -- | Comma-separated CORS origins |
| **RAZORPAY_WEBHOOK_SECRET** | No | -- | Razorpay webhook HMAC secret |

### Configuration Categories

1. **Core** (2 vars): NODE_ENV, PORT
2. **Database** (1 var): DATABASE_URL
3. **Authentication** (3 vars): TOKEN_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL
4. **Email/SMTP** (6 vars): SMTP_HOST/PORT/SECURE/USER/PASS/FROM
5. **SMS** (7 vars): SMS_PROVIDER, MSG91_*, NIC_SMS_*
6. **File Storage** (8 vars): STORAGE_TYPE, UPLOAD_DIR, MINIO_*
7. **Cache** (1 var): REDIS_URL
8. **Deployment** (2 vars): APP_URL, CORS_ORIGINS
9. **Payment** (1 var): RAZORPAY_WEBHOOK_SECRET

### Graceful Degradation

The application degrades gracefully when optional services are not configured:
- **No SMTP_HOST**: Emails logged to console but not sent
- **SMS_PROVIDER=console**: SMS messages logged to console
- **No MINIO_ENDPOINT**: Falls back to local filesystem
- **No REDIS_URL**: Uses in-memory cache
- **No RAZORPAY_WEBHOOK_SECRET**: Webhook endpoint returns 503
