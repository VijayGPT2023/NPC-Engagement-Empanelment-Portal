# Software Requirements Specification (SRS)
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the NPC Contractual Engagement & Empanelment Portal, a web-based application for managing the engagement of contractual persons and empanelment of external experts at the National Productivity Council (NPC).

### 1.2 Scope
The system covers:
- Online application submission for contractual engagement positions
- Online application for empanelment as external expert/associate
- Automated screening and scoring of applications
- Administrative workflow for post management, screening, and selection
- Document management with inline upload
- Reporting and data export

### 1.3 Definitions and Acronyms
| Term | Definition |
|------|-----------|
| NPC | National Productivity Council |
| DPIIT | Department for Promotion of Industry and Internal Trade |
| AI 858 | Administrative Instruction No. 858/2026 — Engagement of Persons on Contract Basis |
| AI 859 | Administrative Instruction No. 859/2026 — Empanelment of External Experts and Associates |
| DG | Director General |
| GH | Group Head |
| RD | Regional Director |
| DDG | Deputy Director General |
| SOP | Standard Operating Procedure |
| PPO | Pension Payment Order |
| DPDP | Digital Personal Data Protection Act 2023 |
| GIGW | Guidelines for Indian Government Websites |

### 1.4 References
- AI No. 858/2026 dated 12-02-2026 (Engagement of Persons on Contract Basis)
- AI No. 859/2026 dated 19-02-2026 (Empanelment of External Experts)
- GIGW 3.0 Guidelines
- DPDP Act 2023
- Aadhaar Act 2016

---

## 2. Overall Description

### 2.1 Product Perspective
The portal replaces the manual email-based application process currently used at NPC. Previously, applications were submitted via email as per Annex-AF format, processed manually by Administration Group, and tracked in spreadsheets.

### 2.2 Product Functions
1. **Applicant Registration & Profile Management** — One-time registration with reusable profile
2. **Post Requirement Publishing** — Admin publishes contractual positions
3. **Online Application Submission** — Multi-step form with document upload
4. **Automated Screening** — Score-based eligibility assessment
5. **Application Processing Workflow** — Screening → Shortlisting → Selection
6. **Empanelment Management** — Separate workflow for expert empanelment
7. **Reporting & Export** — CSV reports, printable summaries
8. **Information Dissemination** — Salary structure, eligibility guides, T&C

### 2.3 User Classes and Characteristics

| User Role | Description | Access Level |
|-----------|-------------|-------------|
| **Applicant** | External professionals applying for engagement/empanelment | Register, apply, track own applications, manage profile |
| **Admin (GH Admin)** | Administration Group at NPC | Full access — post management, application processing, screening, reports |
| **Screening Committee** | Committee of 3 DDGs + DD Admin per AI 859 | View and screen applications, change status |
| **Director General (DG)** | Competent Authority | Same as Admin — final approval |

### 2.4 Operating Environment
- **Client**: Modern web browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- **Server**: Ubuntu Linux 22.04+ (NICSI VM) or Docker container
- **Database**: PostgreSQL 16+
- **Runtime**: Node.js 20.x

### 2.5 Design Constraints
- Must comply with Government of India data localization norms
- No foreign-hosted SaaS dependencies in production
- Hindi and English bilingual support (GIGW compliance)
- Accessible per WCAG 2.1 Level AA
- Must run on NICSI VM infrastructure

---

## 3. Functional Requirements

### 3.1 User Registration & Authentication

| ID | Requirement | Priority |
|----|------------|----------|
| FR-001 | System shall allow new users to register with email, password, and name | Must |
| FR-002 | Password must be min 8 characters with uppercase, lowercase, and digit | Must |
| FR-003 | Registration always assigns "applicant" role (no self-elevation) | Must |
| FR-004 | System shall authenticate users via email + password | Must |
| FR-005 | Auth tokens expire after 24 hours | Must |
| FR-006 | System shall rate-limit login attempts to 10/minute per IP | Must |
| FR-007 | System shall rate-limit registration to 5/minute per IP | Must |

### 3.2 User Profile Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-010 | 5-step registration collects full profile: personal details, qualifications, experience | Must |
| FR-011 | Profile data is saved permanently and reused across all applications | Must |
| FR-012 | User can edit profile at any time from dashboard | Must |
| FR-013 | Profile stores: title, name, DOB, gender, Aadhaar, contact, address, photo | Must |
| FR-014 | Profile supports multiple qualifications with inline certificate upload | Must |
| FR-015 | Profile supports multiple work experiences with inline certificate upload | Must |
| FR-016 | Profile tracks retirement details (date, org, designation, PPO) for retired persons | Must |
| FR-017 | Profile completeness percentage shown on dashboard | Should |

### 3.3 Post Requirement Management (Admin)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-020 | Admin can create new post requirements with all AI 858 fields | Must |
| FR-021 | Posts include: Adv No, Post Code, Title, Role, Domain, Group, Qualification (mandatory + desired), Certification, Experience (years + description + preferred), Age limit + relaxation, Remuneration, Contract period, Eligibility, Responsibilities, T&C, Deadline, Instructions, Annexure ref | Must |
| FR-022 | Admin can upload multiple posts via Excel template | Must |
| FR-023 | Admin can download pre-formatted Excel template | Must |
| FR-024 | Admin can edit any field of an existing post | Must |
| FR-025 | Admin can change post status: active → on_hold → closed / cancelled | Must |
| FR-026 | Admin can extend or shorten application deadline | Must |
| FR-027 | Posts past deadline auto-close via scheduled task | Should |
| FR-028 | Duplicate Advertisement Numbers are rejected | Must |

### 3.4 Engagement Application

| ID | Requirement | Priority |
|----|------------|----------|
| FR-030 | Applicant can browse and apply for active posts | Must |
| FR-031 | Application form auto-fills from saved profile | Must |
| FR-032 | Form steps: Select Post → Personal Details → Qualifications → Experience → Empanelment Opt-in → Declaration | Must |
| FR-033 | Documents uploaded inline with relevant sections | Must |
| FR-034 | Applicant can opt-in for empanelment from engagement form | Must |
| FR-035 | Application generates unique application number | Must |
| FR-036 | Duplicate application to same post is prevented | Must |
| FR-037 | Application submission rate-limited to 5/minute | Must |

### 3.5 Empanelment Application

| ID | Requirement | Priority |
|----|------------|----------|
| FR-040 | Applicant can apply for empanelment independently | Must |
| FR-041 | Form collects: category, service type, domains, expertise areas, preferred offices | Must |
| FR-042 | Categories: Advisor, Senior Consultant, Consultant, Project Associate, Young Professional | Must |
| FR-043 | Applicant selects up to 3 preferred NPC offices | Must |
| FR-044 | Form includes service experience: trainings, consultancy projects, research | Must |
| FR-045 | Includes professional memberships and certifications | Must |

### 3.6 Automated Screening

| ID | Requirement | Priority |
|----|------------|----------|
| FR-050 | System auto-scores applications on: qualification (30pts), experience (30pts), age (10pts), retirement (10pts), remuneration band (20pts) | Must |
| FR-051 | Screening result: eligible (≥60) / needs_review (40-59) / not_eligible (<40) | Must |
| FR-052 | Admin can trigger screening for individual or bulk applications | Must |
| FR-053 | Applicant can view their screening score and breakdown | Should |

### 3.7 Application Processing (Admin)

| ID | Requirement | Priority |
|----|------------|----------|
| FR-060 | Admin can view all applications per post with statistics | Must |
| FR-061 | Admin can change status: submitted → under_screening → shortlisted → selected → offered → accepted / rejected | Must |
| FR-062 | Status changes create audit trail (ScreeningReview records) | Must |
| FR-063 | Admin can add remarks to each status change | Must |
| FR-064 | Bulk status change for multiple applications | Should |

### 3.8 Reporting

| ID | Requirement | Priority |
|----|------------|----------|
| FR-070 | CSV export: engagement applications (per post or all) | Must |
| FR-071 | CSV export: empanelment applications | Must |
| FR-072 | CSV export: post summary | Must |
| FR-073 | CSV export: audit log | Must |
| FR-074 | Post-wise summary report (printable) | Must |
| FR-075 | Admin dashboard with aggregate statistics | Must |

### 3.9 Information Pages

| ID | Requirement | Priority |
|----|------------|----------|
| FR-080 | How to Apply guide | Must |
| FR-081 | Documents required checklist | Must |
| FR-082 | Salary/remuneration structure (Annexure II-A, II-B) | Must |
| FR-083 | Types of engagement explained | Must |
| FR-084 | General terms & conditions | Must |
| FR-085 | Empanelment guide with eligibility matrix | Must |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|------------|
| NFR-001 | Performance | Page load time < 3 seconds on 4G connection |
| NFR-002 | Performance | API response time < 500ms for 95th percentile |
| NFR-003 | Performance | Support 100 concurrent users |
| NFR-004 | Security | HMAC-SHA256 token authentication |
| NFR-005 | Security | Rate limiting on all sensitive endpoints |
| NFR-006 | Security | Security headers (CSP, HSTS, X-Frame-Options) |
| NFR-007 | Security | File upload validation (type, size, magic bytes) |
| NFR-008 | Security | Production secret validation at startup |
| NFR-009 | Compliance | Hindi/English bilingual (GIGW) |
| NFR-010 | Compliance | Accessibility (WCAG 2.1 AA) |
| NFR-011 | Compliance | Privacy Policy (DPDP Act 2023) |
| NFR-012 | Compliance | No foreign SaaS in production |
| NFR-013 | Reliability | Health check endpoint for monitoring |
| NFR-014 | Reliability | Graceful error handling (no stack traces to client) |
| NFR-015 | Maintainability | All config via environment variables |
| NFR-016 | Portability | Docker container for deployment anywhere |
| NFR-017 | Portability | Zero code changes between staging (Railway) and production (NICSI VM) |

---

## 5. Data Requirements

### 5.1 Database Models (20 total)
See [LLD.md](LLD.md) for detailed schema.

Core models: User, UserProfile, PostRequirement, EngagementApplication, EmpanelmentApplication, Qualification, Experience, Document, ScreeningReview, Notification

### 5.2 Data Retention
- Application data: retained for 5 years after engagement ends
- Uploaded documents: retained for duration of engagement + 1 year
- Audit logs: retained permanently
- User accounts: retained until explicit deletion request

---

## 6. Interface Requirements

### 6.1 User Interfaces
- Responsive web (desktop, tablet, mobile)
- Public pages: Homepage, Information Hub, Login, Register
- Applicant pages: Dashboard, Profile, Applications, Apply forms
- Admin pages: Dashboard, Post Management, Application Review, Screening, Tracking, Reports

### 6.2 API Interfaces
16 REST API endpoints. See [API.md](API.md) for full documentation.

### 6.3 External Interfaces
| Interface | Protocol | Purpose |
|-----------|----------|---------|
| SMTP Server | SMTP/TLS | Email notifications |
| MSG91 / NIC Gateway | HTTPS | SMS OTP (future) |
| MinIO | S3 API | Object storage on NICSI VM |

---

## 7. Appendices

### Appendix A: Designation Tiers (AI 858)
1. Support Executive (Class XII)
2. Office Executive / Data Entry Operator / Accounts Executive (Graduate)
3. Technical Executive (ITI/Diploma)
4. Legal Executive (Law degree)
5. Project Executive / Research Executive (Graduate relevant)
6. Senior Professional (Post-graduate/CA/ICWA/MBA)
7. Young Professional (Premier institute, max 35 years, max 3 years tenure)
8. Consultant (6+ years, Graduate)
9. Senior Consultant (10+ / 15+ years)
10. Advisor (20+ years)
11. Senior Advisor (Retired Secretary / Doctorate, 20+ years)
12. Expert (Retired Govt/CPSE/Autonomous)

### Appendix B: Empanelment Categories (AI 859)
- Advisor: 20+ years Group A, Level 12/13+ OR Doctorate + 25 years
- Senior Consultant: 13+ years, Level 12+ OR PG + 13 years
- Consultant: 6-13 years with PG/Engineering
- Project Associate: 0-6 years with PG/Engineering
- Young Professional: Premier institute degree, max 35 years
