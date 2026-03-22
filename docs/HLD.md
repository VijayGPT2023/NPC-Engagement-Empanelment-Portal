# High Level Design (HLD)
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

---

## 1. System Overview

The portal is a monolithic Next.js application serving both frontend (React) and backend (API routes) from a single deployment unit. It connects to PostgreSQL for persistent storage and optionally Redis for caching.

## 2. System Context Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      INTERNET                                 │
│                                                               │
│  ┌─────────┐     ┌─────────┐     ┌──────────┐               │
│  │Applicant│     │  Admin  │     │    DG    │               │
│  │ Browser │     │ Browser │     │ Browser  │               │
│  └────┬────┘     └────┬────┘     └────┬─────┘               │
│       │               │               │                      │
│       └───────────────┼───────────────┘                      │
│                       │ HTTPS                                │
│                       ▼                                      │
│              ┌────────────────┐                              │
│              │  Reverse Proxy │  (Nginx on NICSI VM /        │
│              │   / Railway    │   Railway's edge)            │
│              └───────┬────────┘                              │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Next.js App   │
              │  (Docker/Node)  │
              │                 │
              │ ┌─────────────┐ │
              │ │  Frontend   │ │  React + Tailwind
              │ │  (SSR + CSR)│ │
              │ └─────────────┘ │
              │ ┌─────────────┐ │
              │ │  API Routes │ │  16 REST endpoints
              │ └─────────────┘ │
              │ ┌─────────────┐ │
              │ │  Middleware  │ │  Rate limit, body size, request ID
              │ └─────────────┘ │
              │ ┌─────────────┐ │
              │ │  Cron Jobs  │ │  Expiry checks, cleanup
              │ └─────────────┘ │
              └──┬──────┬──────┬┘
                 │      │      │
    ┌────────────▼┐  ┌──▼───┐  ┌▼──────────┐
    │ PostgreSQL  │  │Redis │  │  MinIO /   │
    │   (Data)    │  │(Cache)│  │ Filesystem │
    │  20 models  │  │ opt. │  │  (Files)   │
    └─────────────┘  └──────┘  └───────────┘
```

## 3. Component Architecture

### 3.1 Frontend Components
```
Homepage (Public)
├── Hero Section
├── CTA Cards (Engagement / Empanelment)
├── Information & Resources (4 cards)
├── Current Openings (from /api/posts)
├── About NPC
├── Office Locations
└── Footer

Auth Pages
├── Login (/auth/login)
└── Register (/auth/register) — 5-step wizard

Applicant Dashboard
├── Dashboard Home (stats cards)
├── My Applications (list + status)
├── Application Detail (timeline + screening)
└── My Profile (edit sections)

Application Forms
├── Engagement Form (6 steps)
│   ├── Select Post
│   ├── Personal Details (auto-fill)
│   ├── Qualifications + certs (auto-fill)
│   ├── Experience + certs (auto-fill)
│   ├── Empanelment Opt-in
│   └── Declaration & Submit
└── Empanelment Form (7 steps)
    ├── Personal Details
    ├── Category & Domain
    ├── Preferred Offices
    ├── Qualifications
    ├── Experience
    ├── Service Experience
    └── Declaration

Admin Pages
├── Dashboard (aggregate stats)
├── Post Management
│   ├── List (with bulk upload)
│   ├── Create Post
│   ├── Edit Post (status management)
│   ├── Post Detail (applications table)
│   └── Post Summary (printable)
├── Applications (all, with detail modal)
├── Screening
└── Status Tracking

Information Hub (7 static pages)
├── How to Apply
├── Documents Required
├── Salary Structure
├── Engagement Types
├── Terms & Conditions
├── Empanelment Guide
└── Hub Landing
```

### 3.2 Backend Services

| Service | Module | Responsibility |
|---------|--------|---------------|
| **Auth Service** | `lib/auth.ts` | Password hashing, token generation/verification |
| **Screening Engine** | `lib/screening-engine.ts` | Auto-scoring of applications |
| **Email Service** | `lib/email.ts` | SMTP email notifications |
| **SMS Service** | `lib/sms.ts` | MSG91/NIC Gateway SMS |
| **Storage Service** | `lib/storage.ts` | File save/retrieve (local or MinIO) |
| **Cache Service** | `lib/cache.ts` | In-memory TTL cache |
| **Rate Limiter** | `lib/rate-limit.ts` | Per-IP request throttling |
| **Logger** | `lib/logger.ts` | Structured JSON logging |
| **Cron Scheduler** | `lib/cron.ts` | Daily cleanup, expiry checks |

## 4. Data Flow

### 4.1 Applicant Registration Flow
```
Browser → POST /api/auth/register → Validate → Hash password → Create User → Return token
Browser → PUT /api/profile → Upsert UserProfile + Qualifications + Experiences
```

### 4.2 Application Submission Flow
```
Browser → POST /api/applications/engagement
  → Validate auth token
  → Check no duplicate application for same post
  → Generate application number (ENG-YYYYMMDD-XXXX)
  → Create EngagementApplication + nested Qualifications + Experiences + Documents
  → If empanelment opt-in: create linked EmpanelmentApplication
  → Return application details
```

### 4.3 Screening Flow
```
Admin → POST /api/screening { applicationId, type }
  → Fetch application with qualifications, experiences, post requirement
  → Run screening engine: score qualification (30), experience (30), age (10), retirement (10), remuneration (20)
  → Update application: autoScreenScore, autoScreenResult, autoScreenDetails (JSON)
  → Return screening result breakdown
```

### 4.4 Bulk Upload Flow
```
Admin → POST /api/posts/bulk-upload (FormData with .xlsx)
  → Parse Excel with XLSX library
  → Normalize column names via flexible mapping
  → For each row: validate, check duplicate, create PostRequirement
  → Return summary: { created, skipped, errors, results[] }
```

## 5. Security Architecture

### 5.1 Authentication
- Custom HMAC-SHA256 token (base64url data + signature)
- Token payload: { userId, email, role, exp }
- 24-hour expiry
- Sent via HTTP-only cookie + Authorization header
- Production requires strong TOKEN_SECRET (process exits if weak)

### 5.2 Authorization
| Role | Access |
|------|--------|
| applicant | Own profile, own applications, public posts, apply |
| admin | Everything + post management + all applications + screening + reports |
| screening_committee | View/screen applications, change status |
| dg | Same as admin |

### 5.3 Rate Limiting
| Endpoint | Limit |
|----------|-------|
| POST /api/auth/login | 10/minute |
| POST /api/auth/register | 5/minute |
| POST /api/applications/* | 5/minute |
| POST /api/upload | 20/minute |

### 5.4 File Upload Security
- Whitelist: PDF, JPG, JPEG, PNG, DOC, DOCX
- Magic byte validation (file header check)
- Document type whitelist (photo, aadhaar, qualification, etc.)
- Path sanitization (no traversal)
- 5MB size limit

## 6. Deployment Architecture

### 6.1 Staging (Railway)
```
Railway Project
├── Web Service (Docker, from GitHub)
│   ├── Start: prisma migrate deploy && node server.js
│   ├── Health: /api/health
│   └── Volume: /app/uploads
├── PostgreSQL (managed)
└── Redis (managed)
```

### 6.2 Production (NICSI VM)
```
NICSI Ubuntu VM
├── Docker Engine
├── docker-compose.yml
│   ├── app (Next.js container)
│   ├── postgres (PostgreSQL 16)
│   ├── redis (Redis 7)
│   └── minio (MinIO for file storage)
├── Nginx (reverse proxy + SSL termination)
└── Certbot (Let's Encrypt SSL) or NIC SSL certificate
```

## 7. Integration Points

| System | Protocol | Status |
|--------|----------|--------|
| NPC Website (npcindia.gov.in) | Link only | Active |
| SMTP Server (NICSI) | SMTP/TLS | Ready (env-configurable) |
| MSG91 SMS Gateway | HTTPS REST | Ready (env-configurable) |
| NIC SMS Gateway | HTTPS REST | Ready (env-configurable) |
| MinIO Object Storage | S3 API | Ready (env-configurable) |
| Razorpay Payment Gateway | Webhook | Placeholder (no payments currently) |
