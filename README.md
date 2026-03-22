# NPC Contractual Engagement & Empanelment Portal

> **National Productivity Council** — Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce & Industry, Government of India

A full-stack web portal for managing contractual engagement and empanelment of external experts at NPC, built per Administrative Instructions AI 858/2026 and AI 859/2026.

**Live URL**: https://npc-engagement-empanelment-portal-production.up.railway.app
**Repository**: https://github.com/VijayGPT2023/NPC-Engagement-Empanelment-Portal

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.7 |
| **Language** | TypeScript | 5.x |
| **Runtime** | Node.js | 20.x (Alpine) |
| **Database** | PostgreSQL | 16 |
| **ORM** | Prisma | 6.19.x |
| **Cache** | Redis (optional) | 7.x |
| **CSS** | Tailwind CSS | 4.x |
| **State Management** | Zustand | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |
| **Auth** | Custom HMAC-SHA256 tokens + bcryptjs | — |
| **Email** | Nodemailer (SMTP) | 6.x |
| **SMS** | MSG91 / NIC Gateway (env-switchable) | — |
| **Storage** | Local filesystem / MinIO (env-switchable) | — |
| **Containerization** | Docker (multi-stage, node:20-alpine) | — |
| **Testing** | Playwright (E2E) + k6 (load) | — |
| **i18n** | Custom Zustand store (Hindi/English) | — |

## Project Structure

```
portal/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # 20 models
│   ├── migrations/            # PostgreSQL migrations
│   ├── seed.ts                # Initial seed (admin users + sample posts)
│   └── seed-posts.ts          # Additional test posts
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # 16 API routes
│   │   │   ├── auth/          # login, register
│   │   │   ├── posts/         # CRUD + bulk-upload + template
│   │   │   ├── applications/  # engagement + empanelment
│   │   │   ├── admin/         # stats, CSV export
│   │   │   ├── profile/       # user profile CRUD
│   │   │   ├── screening/     # auto-screening engine
│   │   │   ├── upload/        # file upload with validation
│   │   │   ├── health/        # health check
│   │   │   └── webhooks/      # Razorpay (placeholder)
│   │   ├── admin/             # Admin pages (dashboard, posts, applications, screening, tracking)
│   │   ├── dashboard/         # Applicant dashboard (applications, profile)
│   │   ├── apply/             # Engagement & Empanelment application forms
│   │   ├── auth/              # Login & Registration (5-step)
│   │   ├── information/       # Information hub (7 pages - salary, guides, T&C)
│   │   ├── privacy-policy/    # DPDP Act 2023 compliant
│   │   ├── terms-of-use/      # Legal terms
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── layout/            # Navbar, NavbarWrapper, Sidebar
│   │   └── ui/                # Badge, Button, Card, DataTable, FileUpload, Input, Modal, Select, TextArea, LanguageSwitcher
│   ├── hooks/                 # useThrottledAction, useGuardedSubmit
│   ├── i18n/                  # en.json, hi.json, index.ts (Zustand store)
│   ├── lib/                   # Core utilities
│   │   ├── auth.ts            # Authentication (bcrypt + HMAC tokens)
│   │   ├── prisma.ts          # Database client singleton
│   │   ├── constants.ts       # NPC offices, domains, designations, remuneration
│   │   ├── screening-engine.ts # Auto-screening scorer
│   │   ├── rate-limit.ts      # Per-endpoint rate limiting
│   │   ├── cache.ts           # In-memory cache (Redis-ready)
│   │   ├── email.ts           # Nodemailer SMTP service
│   │   ├── sms.ts             # MSG91 / NIC Gateway
│   │   ├── storage.ts         # Local / MinIO abstraction
│   │   ├── logger.ts          # Structured JSON logging
│   │   └── cron.ts            # Scheduled tasks
│   ├── middleware.ts           # Request size limit + request ID
│   ├── instrumentation.ts     # Server startup hooks (cron init)
│   └── types/                 # Type stubs (minio.d.ts)
├── e2e/                       # Playwright E2E tests (24 tests)
├── scripts/                   # k6 load test
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local dev (PostgreSQL + Redis + Mailhog)
├── railway.toml               # Railway deployment config
├── start.sh                   # Container startup (migrate + serve)
└── .env.example               # All 30+ env vars documented
```

## Key Features

### For Applicants
- 5-step registration with profile management
- Apply for engagement against advertised posts (auto-fill from profile)
- Apply for empanelment with domain/office preferences
- Opt-in for both engagement + empanelment in single submission
- Inline document upload with qualification/experience details
- Hindi/English bilingual interface
- Application tracking dashboard

### For Administrators
- Post requirement management (create, edit, hold, close, cancel)
- Bulk post upload via Excel template
- Auto-screening engine (qualification, experience, age scoring)
- Application review with status management
- CSV export (engagement apps, empanelment apps, post summary, audit log)
- Post-wise summary reports (printable)
- Dashboard with statistics

### Security & Compliance
- Role-based access (applicant, admin, screening_committee, dg)
- HMAC-SHA256 auth tokens with production secret validation
- Rate limiting on sensitive endpoints
- CSP, HSTS, X-Frame-Options headers
- File upload validation (magic byte check, MIME whitelist, path sanitization)
- Password policy (8+ chars, uppercase, lowercase, digit)
- DPDP Act 2023, Aadhaar Act 2016, IT Act 2000 compliance
- GIGW-compliant sitemap
- No foreign SaaS dependencies in production

## Quick Start (Local Development)

```bash
# Clone
git clone https://github.com/VijayGPT2023/NPC-Engagement-Empanelment-Portal.git
cd NPC-Engagement-Empanelment-Portal

# Install dependencies
npm install

# Start with Docker Compose (PostgreSQL + Redis + Mailhog)
docker-compose up -d

# Or set DATABASE_URL in .env manually
cp .env.example .env
# Edit .env with your PostgreSQL URL

# Run migrations & seed
npx prisma migrate deploy
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open http://localhost:3000

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@npcindia.gov.in | admin123 |
| DG | dg@npcindia.gov.in | dg123456 |
| Screening Committee | screening@npcindia.gov.in | screen123 |
| Applicant | applicant@example.com | test1234 |

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

### Docker
```bash
docker build -t npc-portal .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e TOKEN_SECRET="$(openssl rand -base64 64)" \
  -e NODE_ENV=production \
  npc-portal
```

### NICSI VM (Target Production)
```bash
docker-compose -f docker-compose.yml up -d
```

## Documentation

| Document | Description |
|----------|-------------|
| [SRS](docs/SRS.md) | Software Requirements Specification |
| [HLD](docs/HLD.md) | High Level Design |
| [LLD](docs/LLD.md) | Low Level Design |
| [Architecture](docs/ARCHITECTURE.md) | Software Architecture |
| [Deployment](docs/DEPLOYMENT.md) | Deployment Guide (Railway + NICSI VM) |
| [API Reference](docs/API.md) | API Documentation |

## Testing

```bash
# E2E tests (24 tests)
npx playwright test

# Against deployed URL
BASE_URL="https://your-domain.com" npx playwright test

# Load test (requires k6)
k6 run scripts/load-test.js
```

## License

Internal use only — National Productivity Council, Government of India.

---

Built with Next.js, PostgreSQL, and Prisma. Compliant with MeitY/DPIIT guidelines for government IT systems.
