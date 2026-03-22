# Low Level Design (LLD)
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

---

## 1. Prisma Data Models (20 Models)

All models use UUID primary keys (`@id @default(uuid())`). Timestamps use `@default(now())` and `@updatedAt` where applicable. The database is PostgreSQL.

---

### 1.1 User

Core authentication entity. One user can be an applicant, admin, screening committee member, empanelment committee member, or DG.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | Unique identifier |
| email | String | UNIQUE | Login email, stored lowercase |
| password | String | | bcrypt hash (12 rounds) |
| name | String | | Display name |
| role | String | DEFAULT "applicant" | applicant, admin, screening_committee, empanelment_committee, dg |
| office | String? | | NPC office code association |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:** profile (UserProfile 1:1), engagementApplications (1:N), empanelmentApplications (1:N), screeningReviews (1:N), notifications (1:N)

---

### 1.2 UserProfile

Master data saved once and reused across applications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| userId | String | UNIQUE, FK→User | One profile per user |
| title | String | | Dr., Mr., Mrs., Ms. |
| fullName | String | | |
| fatherMotherSpouseName | String | | |
| dateOfBirth | DateTime | | |
| gender | String | | |
| nationality | String | DEFAULT "Indian" | |
| aadhaarNo | String | | 12-digit Aadhaar |
| contactNo | String | | |
| alternateContactNo | String? | | |
| permanentAddress | String | | |
| correspondenceAddress | String | | |
| photoPath | String? | | Relative file path |
| cvPath | String? | | Relative file path |
| aadhaarDocPath | String? | | Relative file path |
| dobProofPath | String? | | Relative file path |
| isRetiredPerson | Boolean | DEFAULT false | |
| retirementDate | DateTime? | | |
| lastOrganization | String? | | |
| lastDesignation | String? | | |
| ppoNumber | String? | | Pension Payment Order no. |
| ppoDocPath | String? | | Relative file path |
| isComplete | Boolean | DEFAULT false | True when all mandatory fields filled |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:** user (User 1:1), qualifications (ProfileQualification 1:N), experiences (ProfileExperience 1:N)

---

### 1.3 ProfileQualification

Educational qualifications on the master profile.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| profileId | String | FK→UserProfile | CASCADE delete |
| degree | String | | From QUALIFICATION_LEVELS constant |
| discipline | String | | Subject/branch |
| collegeName | String | | |
| universityInstitution | String | | |
| yearOfPassing | Int | | |
| marksPercentage | Float? | | |
| cgpa | Float? | | |
| isHighestQualification | Boolean | DEFAULT false | |
| certificatePath | String? | | Uploaded certificate path |

---

### 1.4 ProfileExperience

Work experience entries on the master profile.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| profileId | String | FK→UserProfile | CASCADE delete |
| organizationName | String | | |
| designation | String | | |
| startDate | DateTime | | |
| endDate | DateTime? | | Null if current |
| isCurrent | Boolean | DEFAULT false | |
| remunerationPayBand | String? | | |
| dutiesDescription | String | | |
| sectorType | String | | government, public, private |
| certificatePath | String? | | |

---

### 1.5 PostRequirement

Admin-published contractual positions (AI 858).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| advertisementNo | String | UNIQUE | e.g. NPC/HQ/2026/001 |
| postCode | String? | | e.g. Adv/01, Adv/02 |
| title | String | | Position title |
| functionalRole | String | | Designation from Annex-II-A/B |
| domain | String | | AB, ES, ECA, EM, HRM, IE, IT, FIN, ADM, ID, IS |
| groupDivisionName | String? | | Human-readable division name |
| engagementType | String | | full_time, part_time, lump_sum, revenue_sharing, resource_person |
| numberOfPositions | Int | DEFAULT 1 | |
| placeOfDeployment | String | | NPC office code |
| minQualification | String | | Mandatory qualification text |
| desiredQualification | String? | | Preferred additional qualifications |
| professionalCertification | String? | | Required certifications |
| minExperienceYears | Int | | |
| experienceDescription | String? | | Detailed required experience |
| preferredExperience | String? | | Preferred additional experience |
| maxAgeLimitYears | Int? | | |
| ageRelaxation | String? | | GoI relaxation norms |
| remunerationRange | String? | | |
| contractPeriod | String? | | |
| eligibilityCriteria | String | | Full eligibility text |
| workResponsibilities | String | | |
| termsAndConditions | String | DEFAULT "" | |
| applicationDeadline | DateTime | | Must be future date |
| applicationInstructions | String? | | |
| annexureFormRef | String? | | e.g. Annex-AF |
| status | String | DEFAULT "active" | active, on_hold, closed, cancelled |
| createdBy | String | | Admin userId |
| createdAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:** applications (EngagementApplication 1:N)

---

### 1.6 EngagementApplication

Engagement application submitted by an applicant against a specific post.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationNo | String | UNIQUE | NPC/ENG/{year}/{seq} |
| userId | String | FK→User | |
| postRequirementId | String | FK→PostRequirement | |
| status | String | DEFAULT "submitted" | submitted, under_screening, shortlisted, selected, rejected, offered, accepted |
| title | String | | |
| fullName | String | | |
| fatherMotherSpouseName | String | | |
| dateOfBirth | DateTime | | |
| gender | String | | |
| nationality | String | DEFAULT "Indian" | |
| aadhaarNo | String | | |
| contactNo | String | | |
| alternateContactNo | String? | | |
| emailId | String | | |
| permanentAddress | String | | |
| correspondenceAddress | String | | |
| postAppliedFor | String | | |
| isRetiredPerson | Boolean | DEFAULT false | |
| retirementDate | DateTime? | | |
| lastOrganization | String? | | |
| lastDesignation | String? | | |
| ppoNumber | String? | | |
| autoScreenScore | Float? | | 0-100 score from screening engine |
| autoScreenResult | String? | | eligible, not_eligible, needs_review |
| autoScreenDetails | String? | | JSON with detailed breakdown |
| alsoApplyEmpanelment | Boolean | DEFAULT false | |
| empanelmentApplicationId | String? | | |
| declarationAccepted | Boolean | DEFAULT false | |
| declarationDate | DateTime? | | |
| submittedAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:** user (User), postRequirement (PostRequirement), qualifications (Qualification 1:N), experiences (Experience 1:N), documents (Document 1:N), screeningReviews (ScreeningReview 1:N), empanelmentApplication (EmpanelmentApplication?)

---

### 1.7 EmpanelmentApplication

Empanelment application for external expert registration (AI 859).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationNo | String | UNIQUE | NPC/EMP/{year}/{seq} |
| userId | String | FK→User | |
| status | String | DEFAULT "submitted" | submitted, under_screening, shortlisted, interview_scheduled, empanelled, rejected |
| title | String | | |
| fullName | String | | |
| fatherMotherSpouseName | String? | | |
| dateOfBirth | DateTime | | |
| gender | String | | |
| nationality | String | DEFAULT "Indian" | |
| aadhaarNo | String? | | |
| contactNo | String | | |
| alternateContactNo | String? | | |
| emailId | String | | |
| personalAddress | String | | |
| categoryApplied | String | | Advisor, Senior Consultant, Consultant, Project Associate, Young Professional |
| serviceType | String | | consultancy, training, both |
| domains | String | | Comma-separated domain codes |
| areasOfExpertise | String | | Comma-separated (up to 10) |
| preferredOffice1 | String | | NPC office code |
| preferredOffice2 | String? | | |
| preferredOffice3 | String? | | |
| willingToWorkAnywhere | Boolean | DEFAULT false | |
| autoScreenScore | Float? | | |
| autoScreenResult | String? | | |
| autoScreenDetails | String? | | |
| empanelmentLetterNo | String? | | Post-approval |
| empanelmentDate | DateTime? | | |
| empanelmentValidTill | DateTime? | | |
| declarationAccepted | Boolean | DEFAULT false | |
| declarationDate | DateTime? | | |
| submittedAt | DateTime | DEFAULT now() | |
| updatedAt | DateTime | @updatedAt | |

**Relations:** user (User), qualifications (EmpanelmentQualification 1:N), experiences (EmpanelmentExperience 1:N), trainingsConducted (TrainingConducted 1:N), consultancyProjects (ConsultancyProject 1:N), actionResearchProjects (ActionResearchProject 1:N), certifications (Certification 1:N), professionalMemberships (ProfessionalMembership 1:N), documents (EmpanelmentDocument 1:N), screeningReviews (ScreeningReview 1:N), linkedEngagementApps (EngagementApplication 1:N)

---

### 1.8 Qualification (Engagement)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EngagementApplication | CASCADE delete |
| degree | String | | |
| discipline | String | | |
| collegeName | String | | |
| universityInstitution | String | | |
| yearOfPassing | Int | | |
| marksPercentage | Float? | | |
| cgpa | Float? | | |
| isHighestQualification | Boolean | DEFAULT false | |
| documentId | String? | | |

---

### 1.9 EmpanelmentQualification

Same as Qualification, plus `groupAService` flag.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| degree | String | | |
| discipline | String | | |
| collegeName | String | | |
| universityInstitution | String | | |
| yearOfPassing | Int | | |
| marksPercentage | Float? | | |
| cgpa | Float? | | |
| isHighestQualification | Boolean | DEFAULT false | |
| groupAService | Boolean | DEFAULT false | Group A service indicator |
| documentId | String? | | |

---

### 1.10 Experience (Engagement)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EngagementApplication | CASCADE delete |
| organizationName | String | | |
| designation | String | | |
| startDate | DateTime | | |
| endDate | DateTime? | | |
| isCurrent | Boolean | DEFAULT false | |
| remunerationPayBand | String? | | |
| dutiesDescription | String | | |
| sectorType | String | | government, public, private |
| documentId | String? | | |

---

### 1.11 EmpanelmentExperience

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| organizationName | String | | |
| designation | String | | |
| startDate | DateTime | | |
| endDate | DateTime? | | |
| isCurrent | Boolean | DEFAULT false | |
| dutiesDescription | String | | |
| sectorType | String | | |
| documentId | String? | | |

---

### 1.12 TrainingConducted (Empanelment)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| trainingTitle | String | | |
| clientOrganization | String | | |
| clientType | String | | government_public, private |
| trainingMode | String | | online, physical |
| startDate | DateTime | | |
| endDate | DateTime | | |
| numberOfParticipants | Int? | | |
| documentId | String? | | |

---

### 1.13 ConsultancyProject (Empanelment)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| projectTitle | String | | |
| clientOrganization | String | | |
| clientType | String | | |
| startDate | DateTime | | |
| endDate | DateTime? | | |
| projectDescription | String | | |
| documentId | String? | | |

---

### 1.14 ActionResearchProject (Empanelment)

Identical structure to ConsultancyProject.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| projectTitle | String | | |
| clientOrganization | String | | |
| clientType | String | | |
| startDate | DateTime | | |
| endDate | DateTime? | | |
| projectDescription | String | | |
| documentId | String? | | |

---

### 1.15 Certification (Empanelment)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| certificationName | String | | |
| issuingOrganization | String | | |
| dateObtained | DateTime | | |
| validTill | DateTime? | | |
| documentId | String? | | |

---

### 1.16 ProfessionalMembership (Empanelment)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EmpanelmentApplication | CASCADE delete |
| institutionName | String | | |
| membershipType | String | | |
| fromDate | DateTime | | |
| toDate | DateTime? | | |

---

### 1.17 Document (Engagement)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| applicationId | String | FK→EngagementApplication | CASCADE delete |
| documentType | String | | photo, aadhaar, dob_proof, qualification, experience, ppo, cv, other |
| documentName | String | | User-provided name |
| fileName | String | | Server-generated filename |
| filePath | String | | Relative path from project root |
| fileSize | Int | | Bytes |
| mimeType | String | | |
| keyDetails | String? | | JSON with inline key details |
| verificationStatus | String | DEFAULT "pending" | pending, verified, rejected |
| verificationRemarks | String? | | |
| uploadedAt | DateTime | DEFAULT now() | |

---

### 1.18 EmpanelmentDocument

Identical structure to Document, linked to EmpanelmentApplication.

---

### 1.19 ScreeningReview

Audit trail for every status change or screening decision.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| reviewerId | String | FK→User | |
| applicationId | String? | FK→EngagementApplication | |
| empanelmentApplicationId | String? | FK→EmpanelmentApplication | |
| applicationType | String | | engagement, empanelment |
| decision | String | | shortlisted, rejected, needs_review |
| remarks | String? | | |
| score | Float? | | |
| reviewedAt | DateTime | DEFAULT now() | |

**Relations:** reviewer (User), engagementApp (EngagementApplication?), empanelmentApp (EmpanelmentApplication?)

---

### 1.20 Notification

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| userId | String | FK→User | |
| title | String | | |
| message | String | | |
| type | String | | application_status, screening, interview, general |
| isRead | Boolean | DEFAULT false | |
| createdAt | DateTime | DEFAULT now() | |

---

## 2. Entity Relationship Diagram

```
┌──────────┐
│   User   │
│──────────│
│ id (PK)  │
│ email    │───────────────┐
│ password │               │
│ role     │               │
│ office   │               │
└──┬───┬───┘               │
   │   │                   │
   │   │ 1:1               │ 1:N
   │   │                   │
   │ ┌─▼──────────────┐   │
   │ │  UserProfile    │   │
   │ │────────────────│   │
   │ │ userId (FK,UQ) │   │
   │ │ title, name... │   │
   │ │ photoPath      │   │
   │ │ isComplete     │   │
   │ └──┬───┬─────────┘   │
   │    │   │              │
   │    │   │ 1:N          │
   │  ┌─▼───▼──────┐      │
   │  │ ProfileQual │      │
   │  │ ProfileExp  │      │
   │  └─────────────┘      │
   │                       │
   │  1:N                  │ 1:N
   │                       │
   ├───┐           ┌───────┘
   │   │           │
   │ ┌─▼───────────▼──────────────┐        ┌─────────────────────┐
   │ │  EngagementApplication      │  N:1   │  PostRequirement     │
   │ │────────────────────────────│◄───────│─────────────────────│
   │ │ applicationNo (UQ)         │        │ advertisementNo (UQ) │
   │ │ userId (FK)                │        │ title, domain        │
   │ │ postRequirementId (FK)     │        │ minQualification     │
   │ │ status                     │        │ minExperienceYears   │
   │ │ autoScreenScore            │        │ applicationDeadline  │
   │ │ autoScreenResult           │        │ status               │
   │ └──┬───┬───┬───┬────────────┘        └──────────────────────┘
   │    │   │   │   │
   │    │   │   │   │ 1:N
   │  ┌─▼─┐ │  ▼   ▼
   │  │Qua│ │ Doc  ScreeningReview◄──── User (reviewer)
   │  │lif│ │  │
   │  └───┘ │  │
   │      ┌─▼──┘
   │      │Exp│
   │      └───┘
   │
   │  1:N
   │
   ├──────────────────────────────────────────────┐
   │                                              │
 ┌─▼──────────────────────────┐                   │
 │  EmpanelmentApplication     │                   │
 │────────────────────────────│                   │
 │ applicationNo (UQ)         │                   │
 │ userId (FK)                │                   │
 │ categoryApplied            │                   │
 │ serviceType, domains       │                   │
 │ autoScreenScore            │                   │
 └──┬──┬──┬──┬──┬──┬──┬──┬───┘                   │
    │  │  │  │  │  │  │  │                        │
    ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼                       │
  EmpQual  EmpExp  Training  Consultancy         │
  EmpDoc   Cert    ActionRes  ProfMember   ┌──────▼──────┐
                                           │ Notification │
                                           │──────────────│
                                           │ userId (FK)  │
                                           │ title, msg   │
                                           │ type, isRead │
                                           └──────────────┘
```

---

## 3. API Route Specifications

### 3.1 Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | None | Register new applicant user |
| POST | /api/auth/login | None | Login and get token |

### 3.2 Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/profile | Bearer token (any role) | Get current user's profile |
| PUT | /api/profile | Bearer token (any role) | Upsert profile with qualifications & experiences |

### 3.3 Posts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/posts | None (public) | List active posts (paginated, filterable) |
| POST | /api/posts | admin, dg | Create new post requirement |
| GET | /api/posts/[id] | None (public) | Get single post with application count |
| PUT | /api/posts/[id] | admin, dg | Update post fields |
| DELETE | /api/posts/[id] | admin, dg | Soft-delete: set status to closed/cancelled |
| POST | /api/posts/bulk-upload | admin, dg | Upload XLSX to create multiple posts |
| GET | /api/posts/template | None | Download XLSX template |

### 3.4 Applications -- Engagement

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/applications/engagement | Bearer token | List (own for applicant, all for admin) |
| POST | /api/applications/engagement | Bearer token (applicant) | Submit new engagement application |
| GET | /api/applications/engagement/[id] | Bearer token (own or admin) | Get full application detail |
| PUT | /api/applications/engagement/[id] | admin, screening_committee, dg | Update application status |

### 3.5 Applications -- Empanelment

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/applications/empanelment | Bearer token | List empanelment applications |
| POST | /api/applications/empanelment | Bearer token (applicant) | Submit new empanelment application |

### 3.6 Screening

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/screening | admin, screening_committee, dg | Trigger auto-screening on an application |
| GET | /api/screening | Bearer token (own or admin) | Get screening results |

### 3.7 Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/admin/stats | admin, dg | Dashboard statistics (cached 2min) |
| GET | /api/admin/export | admin, dg, screening_committee | CSV export (4 report types) |

### 3.8 Upload, Health, Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/upload | Bearer token (any) | File upload (5MB max, type validated) |
| GET | /api/health | None | Health check (DB ping) |
| POST | /api/webhooks/razorpay | HMAC signature | Razorpay payment webhook |

---

## 4. Frontend Component Hierarchy

```
app/layout.tsx (RootLayout)
├── components/layout/Navbar.tsx
│   └── components/ui/LanguageSwitcher.tsx
├── components/layout/NavbarWrapper.tsx
├── components/layout/Sidebar.tsx
│
├── app/page.tsx (Homepage)
│
├── app/auth/
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── app/dashboard/layout.tsx (Authenticated layout with Sidebar)
│   ├── dashboard/page.tsx (Applicant home)
│   ├── dashboard/profile/page.tsx
│   ├── dashboard/applications/page.tsx
│   └── dashboard/applications/[id]/page.tsx
│
├── app/apply/
│   ├── engagement/page.tsx (Multi-step form)
│   └── empanelment/page.tsx (Multi-step form)
│
├── app/admin/layout.tsx (Admin layout with Sidebar)
│   ├── admin/page.tsx (Redirect)
│   ├── admin/dashboard/page.tsx (Stats + charts)
│   ├── admin/posts/page.tsx (List)
│   ├── admin/posts/create/page.tsx
│   ├── admin/posts/[id]/page.tsx (Detail)
│   ├── admin/posts/[id]/edit/page.tsx
│   ├── admin/posts/[id]/summary/page.tsx
│   ├── admin/applications/page.tsx
│   ├── admin/screening/page.tsx
│   └── admin/tracking/page.tsx
│
├── app/information/
│   ├── page.tsx (Index)
│   ├── how-to-apply/page.tsx
│   ├── documents-required/page.tsx
│   ├── empanelment-guide/page.tsx
│   ├── engagement-types/page.tsx
│   ├── salary-structure/page.tsx
│   └── terms-conditions/page.tsx
│
├── app/privacy-policy/page.tsx
└── app/terms-of-use/page.tsx
```

### Shared UI Components (`components/ui/`)

| Component | Description |
|-----------|-------------|
| Button.tsx | Styled button with variants (primary, secondary, danger, outline) |
| Input.tsx | Labeled text input with validation state |
| Select.tsx | Dropdown select with label |
| TextArea.tsx | Multi-line input |
| FileUpload.tsx | Drag-and-drop file upload with progress, type validation |
| Card.tsx | Content card with header/body/footer |
| Modal.tsx | Dialog overlay |
| DataTable.tsx | Paginated, sortable table |
| Badge.tsx | Status badge with color coding |
| LanguageSwitcher.tsx | EN/HI toggle |

---

## 5. State Management

### 5.1 Zustand Stores

**Language Store** (`src/i18n/index.ts`):
- `locale: "en" | "hi"` -- persisted to localStorage key `npc-language`
- `setLocale(locale)` -- switches UI language
- `useTranslation()` hook returns `{ t, locale }` where `t(key)` resolves dot-notation keys from JSON files
- Translation files: `src/i18n/en.json`, `src/i18n/hi.json`

### 5.2 Local State Patterns

- **Form state**: React `useState` for multi-step wizard forms (engagement, empanelment, profile)
- **Auth state**: Token stored in HTTP-only cookie (`npc-token`) + returned in API response for client-side header use
- **Data fetching**: Direct `fetch()` calls in `useEffect` or event handlers; no SWR/React Query
- **Optimistic updates**: Not implemented; all mutations wait for server response

### 5.3 Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| useThrottledAction | `src/hooks/useThrottledAction.ts` | Debounce/throttle user actions (e.g. submit buttons) |
| useGuardedSubmit | `src/hooks/useGuardedSubmit.ts` | Prevent double-submit, show loading state |

---

## 6. File Upload Flow

```
Client (FileUpload component)
    │
    │  1. User selects file
    │  2. Client-side validation:
    │     - File size <= 5MB
    │     - MIME type in allowlist (JPEG, PNG, PDF, DOC, DOCX)
    │     - Extension in allowlist
    │
    ▼
POST /api/upload (formData: file, documentType, documentName)
    │
    │  3. Server-side validation:
    │     a. Rate limit check (20/min per IP)
    │     b. Auth token verification
    │     c. documentType in allowlist (photo, aadhaar, cv, ...)
    │     d. File size <= 5MB
    │     e. MIME type in allowlist
    │     f. Extension in allowlist
    │     g. Magic byte validation (prevent MIME spoofing)
    │        - PDF: %PDF (0x25504446)
    │        - JPEG: FFD8
    │        - PNG: 89504E47
    │        - DOC: D0CF11E0
    │        - DOCX: 504B (ZIP/PK)
    │
    │  4. Filename sanitization:
    │     - Strip path separators, dangerous chars
    │     - Generate: {sanitized}_{timestamp}{ext}
    │
    │  5. Save to disk:
    │     Path: uploads/{userId}/{documentType}/{filename}
    │     Directory created recursively if needed
    │
    │  6. Return relative path for DB storage
    │
    ▼
Response: { fileName, originalName, filePath, fileSize, mimeType, documentType }
    │
    │  7. Client stores filePath in form state
    │  8. On application submit, filePath referenced in Document/EmpanelmentDocument record
```

---

## 7. Screening Engine Algorithm

The screening engine is in `src/lib/screening-engine.ts`. It runs synchronously on the server when triggered by an admin/screening committee member via `POST /api/screening`.

### 7.1 Engagement Screening (100 points)

| Criteria | Points | Logic |
|----------|--------|-------|
| **Qualification** | 30 | Map candidate's highest degree to numeric level (0-10 hierarchy). Map post's minQualification to level. If met: 20 base + up to 10 bonus (3.33 per excess level, max 3 levels). If not met: 0 points. |
| **Experience** | 30 | Calculate total years from all experience entries. If met: 20 base + 1 point per excess year (max 10 bonus). If not met: partial credit = (actual/required) * 20. |
| **Age** | 10 | Calculate age from DOB. If no max age or within limit: 10. If exceeded: 0. |
| **Retired Person** | 10 | If not retired: 10. If retired with PPO: 10. If retired without PPO: 5 (needs review). |
| **Remuneration Band** | 20 | Based on highest marks: >80% = 20pts (100% of max remuneration), >=60% = 15pts (90%), <60% = 10pts (80%). No marks = 15pts default. |

**Overall result determination:**
- `not_eligible`: Any critical failure (qualification, experience, or age not met)
- `needs_review`: No critical failures but retired without PPO, or qualification level undetermined
- `eligible`: All criteria met

**Qualification Hierarchy (numeric levels):**

| Level | Qualifications |
|-------|---------------|
| 1 | Class X |
| 2 | Class XII |
| 3 | ITI/Diploma |
| 4 | Graduate (BA/BSc/BCom), BBA/BCA |
| 5 | B.Tech/BE, LLB, CA/ICWA (Intermediate) |
| 6 | CA/ICWA (Final) |
| 7 | Post Graduate (MA/MSc/MCom), MBA/PGDM |
| 8 | M.Tech/ME, M.Phil |
| 9 | Ph.D/Doctorate |
| 10 | Post Doctorate |

If exact match fails, keyword-based regex matching is used. If still unresolved, level = 0 (flags for manual review).

### 7.2 Empanelment Screening (100 points)

| Criteria | Points | Logic |
|----------|--------|-------|
| **Qualification** | 25 | Same hierarchy check against category-specific minimum. Alternate paths supported (e.g., Doctorate for Advisor). |
| **Experience** | 25 | Check against category min/max range. Upper bound exceeded suggests higher category. |
| **Age** | 10 | Max 65 for most categories, 35 for Young Professional. |
| **Group A Service** | 15 | Applicable for Advisor (20 yrs) and Senior Consultant (12 yrs). Calculates government/public sector experience as proxy. Alternate paths bypass this. |
| **Govt Assignments** | 15 | Count government/public sector entries across experiences, consultancies, action research, trainings. Preferred threshold: 5. Proportional scoring below. |
| **Domain Expertise** | 10 | Text matching: checks if areas of expertise appear in experience/project descriptions. Having certifications or memberships also counts. |

**Category-specific requirements:**

| Category | Min Exp | Max Exp | Min Qual | Max Age | Group A |
|----------|---------|---------|----------|---------|---------|
| Advisor | 20 | -- | Graduate (level 4) | 65 | 20 yrs (10 in Level-12/13+) |
| Senior Consultant | 12 | -- | Graduate (level 4) | 65 | 12 yrs (5 in Level-12) |
| Consultant | 6 | 13 | Post Grad/Engineering (level 5) | 65 | N/A |
| Project Associate | 0 | 6 | Post Grad/Engineering (level 5) | 65 | N/A |
| Young Professional | 0 | 1 | Professional degree (level 5) | 35 | N/A |

---

## 8. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     REGISTRATION                             │
│                                                              │
│  1. POST /api/auth/register { email, password, name }        │
│  2. Rate limit check (5/min per IP)                          │
│  3. Validate:                                                │
│     - Email format (regex)                                   │
│     - Password: min 8 chars, 1 uppercase, 1 lowercase, 1 digit│
│     - No existing user with same email                       │
│  4. Hash password with bcrypt (12 rounds)                    │
│  5. Create User with role = "applicant" (hardcoded)          │
│  6. Return user object (no token -- must login separately)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       LOGIN                                  │
│                                                              │
│  1. POST /api/auth/login { email, password }                 │
│  2. Rate limit check (10/min per IP)                         │
│  3. Find user by email (lowercase, trimmed)                  │
│  4. Verify password via bcrypt.compare()                     │
│  5. Generate token:                                          │
│     a. Build payload: { userId, role, exp: now + 24h }       │
│     b. JSON.stringify → base64url encode → "data"            │
│     c. HMAC-SHA256(data, TOKEN_SECRET) → hex → base64url     │
│     d. Token = "{data}.{signature}"                          │
│  6. Return token in JSON body AND set HTTP-only cookie       │
│     Cookie: npc-token, httpOnly, secure (prod), sameSite=lax │
│     Max-Age: 24 hours                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TOKEN VERIFICATION                         │
│  (getSessionFromRequest -- called by every protected route)  │
│                                                              │
│  1. Check Authorization header first:                        │
│     "Bearer {token}" → extract token                         │
│  2. If no header, check cookie "npc-token"                   │
│  3. Split token on "." → [data, signature]                   │
│  4. Recompute HMAC-SHA256(data, TOKEN_SECRET)                │
│  5. Compare signatures (NOT timing-safe for auth tokens)     │
│  6. Decode data from base64url → JSON parse                  │
│  7. Check exp > Date.now()                                   │
│  8. Return { userId, role } or null                          │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- No JWT library dependency -- custom HMAC-SHA256 token format using Node.js `crypto`
- TOKEN_SECRET resolved lazily at first request (not at import time) to avoid build failures
- In production, missing/weak TOKEN_SECRET causes `process.exit(1)`
- In development, falls back to a hardcoded dev-only secret
- Privileged roles (admin, dg, etc.) can only be created via database seed or admin panel

---

## 9. Rate Limiting Implementation

Implemented in `src/lib/rate-limit.ts` using an in-memory `Map<string, RateLimitEntry>`.

### Rate Limit Configuration

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| Login | 60s | 10 |
| Register | 60s | 5 |
| Submit (application) | 60s | 5 |
| Upload | 60s | 20 |
| Forgot Password | 60s | 3 |
| General | 60s | 60 |

### Algorithm

```
checkRateLimit(identifier, config) → { success, remaining, resetAt }

1. Identifier = "{endpoint}:{IP address}"
   IP extracted from x-forwarded-for or x-real-ip header
2. Lookup identifier in Map
3. If no entry or window expired:
   - Create new entry { count: 1, resetAt: now + windowMs }
   - Return success=true
4. If window active:
   - Increment count
   - If count > maxRequests: Return success=false, status 429
   - Else: Return success=true, remaining = max - count
```

### Cleanup

A `setInterval` runs every 5 minutes to remove expired entries from the Map, preventing memory leaks.

### Limitations

- In-memory only -- resets on process restart
- Not shared across multiple instances (single-process deployment assumed)
- Production note in code: should use Redis when `REDIS_URL` is set (not yet implemented)
