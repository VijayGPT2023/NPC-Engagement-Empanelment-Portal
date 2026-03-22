# API Documentation
## NPC Contractual Engagement & Empanelment Portal
### Version 1.0 | March 2026

**Base URL:** `https://engagement.npcindia.gov.in` (production) or `http://localhost:3000` (development)

**Authentication:** Pass token via `Authorization: Bearer {token}` header or `npc-token` HTTP-only cookie.

---

## 1. Authentication

### 1.1 POST /api/auth/register

Register a new applicant user. Only creates users with role `applicant`.

**Auth:** None

**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```json
{
  "email": "applicant@example.com",
  "password": "SecurePass1",
  "name": "Rajesh Kumar"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| name | string | Yes | Non-empty |

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "applicant@example.com",
    "name": "Rajesh Kumar",
    "role": "applicant",
    "createdAt": "2026-03-19T10:00:00.000Z"
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing field / invalid email / weak password |
| 409 | Email already exists |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"applicant@example.com","password":"SecurePass1","name":"Rajesh Kumar"}'
```

---

### 1.2 POST /api/auth/login

Authenticate and receive a token. Token is also set as an HTTP-only cookie.

**Auth:** None

**Rate Limit:** 10 requests/minute per IP

**Request Body:**
```json
{
  "email": "applicant@example.com",
  "password": "SecurePass1"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbG...signature",
  "user": {
    "id": "uuid",
    "email": "applicant@example.com",
    "name": "Rajesh Kumar",
    "role": "applicant"
  }
}
```

**Response Headers:** Sets `npc-token` cookie (httpOnly, secure in production, sameSite=lax, 24h maxAge)

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing email or password |
| 401 | Invalid email or password |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"applicant@example.com","password":"SecurePass1"}'
```

---

## 2. Profile

### 2.1 GET /api/profile

Get the logged-in user's master profile with qualifications and experiences.

**Auth:** Bearer token (any role)

**Response (200):**
```json
{
  "profile": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Mr.",
    "fullName": "Rajesh Kumar",
    "fatherMotherSpouseName": "Suresh Kumar",
    "dateOfBirth": "1985-05-15T00:00:00.000Z",
    "gender": "Male",
    "nationality": "Indian",
    "aadhaarNo": "123456789012",
    "contactNo": "9876543210",
    "alternateContactNo": null,
    "permanentAddress": "123, Main Street, New Delhi",
    "correspondenceAddress": "Same as permanent",
    "photoPath": "uploads/uuid/photo/photo_123.jpg",
    "cvPath": "uploads/uuid/cv/cv_123.pdf",
    "isRetiredPerson": false,
    "isComplete": true,
    "qualifications": [
      {
        "id": "uuid",
        "degree": "M.Tech/M.E.",
        "discipline": "Computer Science",
        "collegeName": "IIT Delhi",
        "universityInstitution": "IIT Delhi",
        "yearOfPassing": 2010,
        "marksPercentage": 82.5,
        "cgpa": null,
        "isHighestQualification": true,
        "certificatePath": "uploads/uuid/qualification/cert_123.pdf"
      }
    ],
    "experiences": [
      {
        "id": "uuid",
        "organizationName": "NIC",
        "designation": "Senior Developer",
        "startDate": "2012-06-01T00:00:00.000Z",
        "endDate": null,
        "isCurrent": true,
        "remunerationPayBand": "Level 11",
        "dutiesDescription": "Software development and architecture",
        "sectorType": "government",
        "certificatePath": null
      }
    ]
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized |
| 404 | Profile not found |
| 500 | Internal server error |

**Example:**
```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.2 PUT /api/profile

Create or update the user's master profile. Uses upsert -- creates if not exists, updates if exists. Qualifications and experiences are replaced entirely (delete + recreate).

**Auth:** Bearer token (any role)

**Request Body:**
```json
{
  "title": "Mr.",
  "fullName": "Rajesh Kumar",
  "fatherMotherSpouseName": "Suresh Kumar",
  "dateOfBirth": "1985-05-15",
  "gender": "Male",
  "nationality": "Indian",
  "aadhaarNo": "123456789012",
  "contactNo": "9876543210",
  "alternateContactNo": null,
  "permanentAddress": "123, Main Street, New Delhi",
  "correspondenceAddress": "Same as permanent",
  "photoPath": "uploads/uuid/photo/photo_123.jpg",
  "cvPath": "uploads/uuid/cv/cv_123.pdf",
  "aadhaarDocPath": "uploads/uuid/aadhaar/aadhaar_123.pdf",
  "dobProofPath": null,
  "isRetiredPerson": false,
  "qualifications": [
    {
      "degree": "M.Tech/M.E.",
      "discipline": "Computer Science",
      "collegeName": "IIT Delhi",
      "universityInstitution": "IIT Delhi",
      "yearOfPassing": 2010,
      "marksPercentage": 82.5,
      "isHighestQualification": true,
      "certificatePath": "uploads/uuid/qualification/cert_123.pdf"
    }
  ],
  "experiences": [
    {
      "organizationName": "NIC",
      "designation": "Senior Developer",
      "startDate": "2012-06-01",
      "endDate": null,
      "isCurrent": true,
      "remunerationPayBand": "Level 11",
      "dutiesDescription": "Software development",
      "sectorType": "government",
      "certificatePath": null
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Profile saved successfully",
  "profile": { "...same shape as GET response..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized |
| 500 | Internal server error |

**Example:**
```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mr.","fullName":"Rajesh Kumar","dateOfBirth":"1985-05-15","gender":"Male","aadhaarNo":"123456789012","contactNo":"9876543210","permanentAddress":"Delhi","qualifications":[],"experiences":[]}'
```

---

## 3. Posts

### 3.1 GET /api/posts

List post requirements with pagination and filtering.

**Auth:** None (public)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | "active" | active, on_hold, closed, cancelled |
| domain | string | -- | Filter by domain code (IT, HRM, etc.) |
| engagementType | string | -- | full_time, part_time, etc. |
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "posts": [
    {
      "id": "uuid",
      "advertisementNo": "NPC/HQ/2026/001",
      "postCode": "Adv/01",
      "title": "Consultant - Information Technology",
      "functionalRole": "consultant",
      "domain": "IT",
      "engagementType": "full_time",
      "numberOfPositions": 2,
      "placeOfDeployment": "HQ",
      "minQualification": "Graduate in relevant discipline",
      "minExperienceYears": 6,
      "applicationDeadline": "2026-06-30T00:00:00.000Z",
      "status": "active",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Caching:** Results cached for 5 minutes in memory.

**Example:**
```bash
curl "http://localhost:3000/api/posts?domain=IT&page=1&limit=10"
```

---

### 3.2 POST /api/posts

Create a new post requirement.

**Auth:** admin, dg

**Request Body:**
```json
{
  "advertisementNo": "NPC/HQ/2026/001",
  "postCode": "Adv/01",
  "title": "Consultant - Information Technology",
  "functionalRole": "consultant",
  "domain": "IT",
  "groupDivisionName": "IT Group at NPC, HQ, New Delhi",
  "engagementType": "full_time",
  "numberOfPositions": 2,
  "placeOfDeployment": "HQ",
  "minQualification": "Graduate in relevant discipline from recognized university",
  "desiredQualification": "M.Tech preferred",
  "professionalCertification": null,
  "minExperienceYears": 6,
  "experienceDescription": "Expertise in software development",
  "preferredExperience": null,
  "maxAgeLimitYears": 65,
  "ageRelaxation": "As per GoI norms",
  "remunerationRange": "Rs. 75,000/month",
  "contractPeriod": "1 year (extendable)",
  "eligibilityCriteria": "Detailed eligibility text",
  "workResponsibilities": "1. Develop software\n2. Manage projects",
  "termsAndConditions": "Purely contractual",
  "applicationInstructions": null,
  "annexureFormRef": "Annex-AF",
  "applicationDeadline": "2026-06-30"
}
```

**Required Fields:** advertisementNo, title, functionalRole, domain, engagementType, placeOfDeployment, minQualification, minExperienceYears, eligibilityCriteria, workResponsibilities, applicationDeadline

**Response (201):**
```json
{
  "message": "Post requirement created successfully",
  "post": { "...full post object..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing required fields / deadline in past |
| 401 | Unauthorized |
| 403 | Not admin/dg |
| 409 | Advertisement number already exists |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"advertisementNo":"NPC/HQ/2026/001","title":"Consultant - IT","functionalRole":"consultant","domain":"IT","engagementType":"full_time","placeOfDeployment":"HQ","minQualification":"Graduate","minExperienceYears":6,"eligibilityCriteria":"As per adv","workResponsibilities":"Software development","applicationDeadline":"2026-06-30"}'
```

---

### 3.3 GET /api/posts/[id]

Get a single post with application count.

**Auth:** None (public)

**Response (200):**
```json
{
  "post": {
    "id": "uuid",
    "advertisementNo": "NPC/HQ/2026/001",
    "...all post fields...",
    "_count": {
      "applications": 15
    }
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 404 | Post not found |
| 500 | Internal server error |

**Example:**
```bash
curl http://localhost:3000/api/posts/POST_UUID
```

---

### 3.4 PUT /api/posts/[id]

Update post fields. Only provided fields are updated.

**Auth:** admin, dg

**Request Body:** Any subset of post fields (same shape as POST, all optional)

**Response (200):**
```json
{
  "message": "Post updated successfully",
  "post": { "...updated post..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized |
| 403 | Not admin/dg |
| 404 | Post not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"on_hold"}'
```

---

### 3.5 DELETE /api/posts/[id]

Soft-delete a post by changing status to `cancelled` or `closed`.

**Auth:** admin, dg

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| action | string | "cancel" | "cancel" (set cancelled) or "close" (set closed) |

**Response (200):**
```json
{
  "message": "Post cancelled successfully",
  "post": { "...post with updated status..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized |
| 403 | Not admin/dg |
| 404 | Post not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/posts/POST_UUID?action=close" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### 3.6 POST /api/posts/bulk-upload

Upload an XLSX file to create multiple posts at once. Skips duplicates, reports per-row results.

**Auth:** admin, dg

**Request:** `multipart/form-data` with field `file` (XLSX/XLS)

**Response (200):**
```json
{
  "message": "Bulk upload complete: 3 created, 1 skipped, 1 errors",
  "summary": {
    "total": 5,
    "created": 3,
    "skipped": 1,
    "errors": 1
  },
  "results": [
    { "row": 2, "advNo": "NPC/001", "status": "created", "message": "Consultant - IT" },
    { "row": 3, "advNo": "NPC/002", "status": "skipped", "message": "Already exists" },
    { "row": 4, "advNo": "", "status": "error", "message": "Advertisement No is required" }
  ]
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | No file / not XLSX / empty file |
| 403 | Not admin/dg |
| 500 | Processing error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/posts/bulk-upload \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@posts.xlsx"
```

---

### 3.7 GET /api/posts/template

Download the XLSX template for bulk upload.

**Auth:** None

**Response:** Binary XLSX file download (`NPC_Post_Requirements_Template.xlsx`)

**Example:**
```bash
curl -o template.xlsx http://localhost:3000/api/posts/template
```

---

## 4. Applications -- Engagement

### 4.1 GET /api/applications/engagement

List engagement applications. Applicants see only their own; admin/committee see all.

**Auth:** Bearer token (any role)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | -- | Filter by application status |
| postId | string | -- | Filter by post requirement ID |
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "applicationNo": "NPC/ENG/2026/0001",
      "userId": "uuid",
      "status": "submitted",
      "fullName": "Rajesh Kumar",
      "postRequirement": {
        "id": "uuid",
        "title": "Consultant - IT",
        "advertisementNo": "NPC/HQ/2026/001",
        "functionalRole": "consultant",
        "domain": "IT"
      },
      "qualifications": [...],
      "experiences": [...],
      "documents": [...],
      "screeningReviews": [...],
      "_count": {
        "qualifications": 2,
        "experiences": 3,
        "documents": 5
      },
      "submittedAt": "2026-03-19T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/applications/engagement?status=submitted&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4.2 POST /api/applications/engagement

Submit a new engagement application for a specific post.

**Auth:** Bearer token (applicant)

**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```json
{
  "postRequirementId": "uuid",
  "title": "Mr.",
  "fullName": "Rajesh Kumar",
  "fatherMotherSpouseName": "Suresh Kumar",
  "dateOfBirth": "1985-05-15",
  "gender": "Male",
  "nationality": "Indian",
  "aadhaarNo": "123456789012",
  "contactNo": "9876543210",
  "alternateContactNo": null,
  "emailId": "rajesh@example.com",
  "permanentAddress": "123, Main Street, New Delhi",
  "correspondenceAddress": "Same as permanent",
  "postAppliedFor": "Consultant - IT",
  "isRetiredPerson": false,
  "alsoApplyEmpanelment": false,
  "declarationAccepted": true,
  "qualifications": [
    {
      "degree": "M.Tech/M.E.",
      "discipline": "Computer Science",
      "collegeName": "IIT Delhi",
      "universityInstitution": "IIT Delhi",
      "yearOfPassing": 2010,
      "marksPercentage": 82.5,
      "isHighestQualification": true
    }
  ],
  "experiences": [
    {
      "organizationName": "NIC",
      "designation": "Senior Developer",
      "startDate": "2012-06-01",
      "endDate": null,
      "isCurrent": true,
      "dutiesDescription": "Software development and architecture",
      "sectorType": "government"
    }
  ]
}
```

**Required Fields:** postRequirementId, title, fullName, fatherMotherSpouseName, dateOfBirth, gender, aadhaarNo, contactNo, emailId, permanentAddress, correspondenceAddress, postAppliedFor

**Response (201):**
```json
{
  "message": "Engagement application submitted successfully",
  "application": {
    "id": "uuid",
    "applicationNo": "NPC/ENG/2026/0001",
    "status": "submitted",
    "...all fields...",
    "qualifications": [...],
    "experiences": [...],
    "postRequirement": { "title": "...", "advertisementNo": "..." }
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing required fields / post not active / deadline passed |
| 401 | Unauthorized |
| 404 | Post requirement not found |
| 409 | Already applied for this post |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/applications/engagement \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postRequirementId":"uuid","title":"Mr.","fullName":"Rajesh Kumar","fatherMotherSpouseName":"Suresh Kumar","dateOfBirth":"1985-05-15","gender":"Male","aadhaarNo":"123456789012","contactNo":"9876543210","emailId":"rajesh@example.com","permanentAddress":"Delhi","correspondenceAddress":"Delhi","postAppliedFor":"Consultant","declarationAccepted":true}'
```

---

### 4.3 GET /api/applications/engagement/[id]

Get full application with all relations (post, qualifications, experiences, documents, screening reviews).

**Auth:** Bearer token (own application or admin/screening_committee/dg)

**Response (200):**
```json
{
  "application": {
    "id": "uuid",
    "applicationNo": "NPC/ENG/2026/0001",
    "...all fields...",
    "postRequirement": { "...full post..." },
    "qualifications": [...],
    "experiences": [...],
    "documents": [...],
    "screeningReviews": [
      {
        "id": "uuid",
        "decision": "shortlisted",
        "remarks": "Meets all criteria",
        "reviewedAt": "2026-03-20T10:00:00.000Z",
        "reviewer": { "id": "uuid", "name": "Admin User", "role": "admin" }
      }
    ]
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized |
| 403 | Applicant trying to view another's application |
| 404 | Application not found |
| 500 | Internal server error |

**Example:**
```bash
curl http://localhost:3000/api/applications/engagement/APP_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4.4 PUT /api/applications/engagement/[id]

Update application status. Creates a ScreeningReview audit record.

**Auth:** admin, screening_committee, dg

**Request Body:**
```json
{
  "status": "shortlisted",
  "remarks": "Candidate meets all eligibility criteria"
}
```

**Valid statuses:** submitted, under_screening, shortlisted, selected, rejected, offered, accepted

**Response (200):**
```json
{
  "message": "Application status updated successfully",
  "application": { "id": "uuid", "status": "shortlisted", "..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing status / invalid status value |
| 401 | Unauthorized |
| 403 | Insufficient role |
| 404 | Application not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X PUT http://localhost:3000/api/applications/engagement/APP_UUID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"shortlisted","remarks":"Meets all criteria"}'
```

---

## 5. Applications -- Empanelment

### 5.1 GET /api/applications/empanelment

List empanelment applications. Applicants see only their own.

**Auth:** Bearer token (any role)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | -- | Filter by status |
| categoryApplied | string | -- | Filter by empanelment category |
| page | int | 1 | Page number |
| limit | int | 20 | Max 100 |

**Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "applicationNo": "NPC/EMP/2026/0001",
      "status": "submitted",
      "fullName": "Dr. Anita Sharma",
      "categoryApplied": "Senior Consultant",
      "serviceType": "both",
      "domains": "HRM,IT",
      "qualifications": [...],
      "experiences": [...],
      "trainingsConducted": [...],
      "consultancyProjects": [...],
      "actionResearchProjects": [...],
      "certifications": [...],
      "professionalMemberships": [...],
      "documents": [...]
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/applications/empanelment?categoryApplied=Consultant" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5.2 POST /api/applications/empanelment

Submit a new empanelment application.

**Auth:** Bearer token (applicant)

**Rate Limit:** 5 requests/minute per IP

**Request Body:**
```json
{
  "title": "Dr.",
  "fullName": "Anita Sharma",
  "fatherMotherSpouseName": "R.K. Sharma",
  "dateOfBirth": "1975-03-10",
  "gender": "Female",
  "nationality": "Indian",
  "aadhaarNo": "987654321012",
  "contactNo": "9876543210",
  "emailId": "anita@example.com",
  "personalAddress": "456, Sector 15, Gurgaon",
  "categoryApplied": "Senior Consultant",
  "serviceType": "both",
  "domains": "HRM,IT",
  "areasOfExpertise": "Performance Management,Lean Six Sigma,Digital Transformation",
  "preferredOffice1": "HQ",
  "preferredOffice2": "BLR",
  "preferredOffice3": null,
  "willingToWorkAnywhere": true,
  "declarationAccepted": true,
  "qualifications": [...],
  "experiences": [...],
  "trainingsConducted": [
    {
      "trainingTitle": "Lean Management for Government",
      "clientOrganization": "Ministry of Finance",
      "clientType": "government_public",
      "trainingMode": "physical",
      "startDate": "2024-01-15",
      "endDate": "2024-01-17",
      "numberOfParticipants": 30
    }
  ],
  "consultancyProjects": [
    {
      "projectTitle": "Digital Transformation Roadmap",
      "clientOrganization": "ONGC",
      "clientType": "government_public",
      "startDate": "2023-06-01",
      "endDate": "2024-02-28",
      "projectDescription": "Developed digital transformation strategy"
    }
  ],
  "actionResearchProjects": [...],
  "certifications": [
    {
      "certificationName": "Lean Six Sigma Black Belt",
      "issuingOrganization": "ASQ",
      "dateObtained": "2020-06-15",
      "validTill": null
    }
  ],
  "professionalMemberships": [
    {
      "institutionName": "Indian Society for Training and Development",
      "membershipType": "Fellow",
      "fromDate": "2015-01-01",
      "toDate": null
    }
  ]
}
```

**Required Fields:** title, fullName, dateOfBirth, gender, contactNo, emailId, personalAddress, categoryApplied, serviceType, domains, areasOfExpertise, preferredOffice1

**Valid Categories:** Advisor, Senior Consultant, Consultant, Project Associate, Young Professional

**Valid Service Types:** consultancy, training, both

**Response (201):**
```json
{
  "message": "Empanelment application submitted successfully",
  "application": { "id": "uuid", "applicationNo": "NPC/EMP/2026/0001", "..." }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing fields / invalid category / invalid service type |
| 401 | Unauthorized |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/applications/empanelment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dr.","fullName":"Anita Sharma","dateOfBirth":"1975-03-10","gender":"Female","contactNo":"9876543210","emailId":"anita@example.com","personalAddress":"Gurgaon","categoryApplied":"Senior Consultant","serviceType":"both","domains":"HRM,IT","areasOfExpertise":"Performance Management","preferredOffice1":"HQ","declarationAccepted":true}'
```

---

## 6. Screening

### 6.1 POST /api/screening

Trigger auto-screening on an application. Updates the application's screening fields.

**Auth:** admin, screening_committee, dg

**Request Body:**
```json
{
  "applicationId": "uuid",
  "type": "engagement"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| applicationId | string | Yes | UUID of the application |
| type | string | Yes | "engagement" or "empanelment" |

**Response (200):**
```json
{
  "message": "Screening completed successfully",
  "screening": {
    "applicationId": "uuid",
    "applicationNo": "NPC/ENG/2026/0001",
    "score": 85.5,
    "result": "eligible",
    "details": {
      "qualificationMatch": {
        "met": true,
        "candidateLevel": 8,
        "requiredLevel": 4,
        "candidateHighestDegree": "M.Tech/M.E.",
        "requiredQualification": "Graduate",
        "remarks": "Qualification requirement met."
      },
      "experienceMatch": {
        "met": true,
        "candidateTotalYears": 14.2,
        "requiredYears": 6,
        "remarks": "Experience requirement met."
      },
      "ageMatch": {
        "met": true,
        "candidateAge": 41,
        "maxAge": 65,
        "remarks": "Age requirement met."
      },
      "retiredPersonCheck": {
        "applicable": false,
        "ppoProvided": false,
        "remarks": "Not applicable."
      },
      "remunerationBand": {
        "percentageOfMax": 100,
        "highestMarks": 82.5,
        "remarks": "Highest marks: 82.5%."
      },
      "overallResult": "eligible",
      "remarks": ["All screening criteria met."]
    }
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing applicationId/type, invalid type |
| 401 | Unauthorized |
| 403 | Insufficient role |
| 404 | Application not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/screening \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"applicationId":"APP_UUID","type":"engagement"}'
```

---

### 6.2 GET /api/screening

Get screening results for an application.

**Auth:** Bearer token (own application or admin/screening_committee/dg)

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| applicationId | string | Yes | UUID of the application |
| type | string | Yes | "engagement" or "empanelment" |

**Response (200):**
```json
{
  "screening": {
    "id": "uuid",
    "applicationNo": "NPC/ENG/2026/0001",
    "fullName": "Rajesh Kumar",
    "status": "under_screening",
    "autoScreenScore": 85.5,
    "autoScreenResult": "eligible",
    "autoScreenDetails": {
      "qualificationMatch": { "..." },
      "experienceMatch": { "..." },
      "...": "..."
    },
    "screeningReviews": [
      {
        "id": "uuid",
        "decision": "shortlisted",
        "remarks": "Meets criteria",
        "reviewedAt": "2026-03-20T10:00:00.000Z",
        "reviewer": { "id": "uuid", "name": "Admin", "role": "admin" }
      }
    ]
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing query params / invalid type |
| 401 | Unauthorized |
| 403 | Applicant trying to view another's screening |
| 404 | Application not found |
| 500 | Internal server error |

**Example:**
```bash
curl "http://localhost:3000/api/screening?applicationId=APP_UUID&type=engagement" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Admin

### 7.1 GET /api/admin/stats

Dashboard statistics including post counts, application breakdowns, recent activity, and empanelment list.

**Auth:** admin, dg

**Caching:** 2-minute TTL

**Response (200):**
```json
{
  "posts": {
    "total": 10,
    "active": 6,
    "closed": 4
  },
  "engagementApplications": {
    "total": 150,
    "submitted": 80,
    "under_screening": 30,
    "shortlisted": 20,
    "selected": 10,
    "rejected": 10
  },
  "empanelmentApplications": {
    "total": 45,
    "submitted": 20,
    "under_screening": 10,
    "shortlisted": 8,
    "empanelled": 7
  },
  "postWise": [
    {
      "id": "uuid",
      "advertisementNo": "NPC/HQ/2026/001",
      "title": "Consultant - IT",
      "domain": "IT",
      "placeOfDeployment": "HQ",
      "applicationDeadline": "2026-06-30T00:00:00.000Z",
      "status": "active",
      "applicationCounts": {
        "total": 15,
        "submitted": 8,
        "under_screening": 3,
        "shortlisted": 2,
        "selected": 1,
        "rejected": 1
      }
    }
  ],
  "recentActivity": [
    {
      "type": "application_received",
      "message": "New application NPC/ENG/2026/0015 received for Consultant - IT",
      "timestamp": "2026-03-19T10:30:00.000Z"
    }
  ],
  "empanelmentList": [
    {
      "id": "uuid",
      "applicationNo": "NPC/EMP/2026/0001",
      "fullName": "Dr. Anita Sharma",
      "categoryApplied": "Senior Consultant",
      "domains": "HRM,IT",
      "status": "submitted",
      "autoScreenScore": null
    }
  ]
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 401 | Unauthorized / not admin or dg |
| 500 | Internal server error |

**Example:**
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### 7.2 GET /api/admin/export

Export data as CSV file.

**Auth:** admin, dg, screening_committee

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | "engagement_applications" | Report type (see below) |
| postId | string | -- | Filter engagement apps by post ID |

**Report Types:**

| Type | Description | Columns |
|------|-------------|---------|
| `engagement_applications` | All engagement applications (optional postId filter) | S.No, Application No, Adv No, Post Title, Name, Email, Gender, DOB, Contact, Qualification, Total Exp, Status, Score, Screen Result, Submitted At |
| `empanelment_applications` | All empanelment applications | S.No, Application No, Name, Email, Gender, Category, Service Type, Domains, Preferred Office, Status, Score, Submitted At |
| `post_summary` | All posts with application counts | S.No, Adv No, Title, Domain, Role, Type, Positions, Place, Deadline, Status, Applications |
| `audit_log` | Last 1000 screening reviews | S.No, Date, Reviewer, Reviewer Email, Application Type, Application ID, Decision, Remarks |

**Response:** CSV file download

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Invalid report type |
| 403 | Insufficient role |
| 500 | Export failed |

**Example:**
```bash
curl -o report.csv "http://localhost:3000/api/admin/export?type=engagement_applications&postId=POST_UUID" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 8. Upload

### 8.1 POST /api/upload

Upload a document file. Returns the relative file path for use in application/profile forms.

**Auth:** Bearer token (any role)

**Rate Limit:** 20 requests/minute per IP

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | The document file |
| documentType | string | Yes | photo, aadhaar, dob_proof, qualification, experience, ppo, cv, other, retirement, signature |
| documentName | string | No | Human-readable name (defaults to original filename) |

**Validation:**
- Max file size: 5MB
- Allowed MIME types: image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Allowed extensions: .pdf, .jpg, .jpeg, .png, .doc, .docx
- Magic byte validation (prevents MIME spoofing)

**Response (201):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "fileName": "photo_1710842400000.jpg",
    "originalName": "my_photo.jpg",
    "filePath": "uploads/user-uuid/photo/photo_1710842400000.jpg",
    "fileSize": 245760,
    "mimeType": "image/jpeg",
    "documentType": "photo",
    "documentName": "my_photo.jpg"
  }
}
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | No file / invalid document type / file too large / invalid MIME / invalid extension / MIME spoofing detected |
| 401 | Unauthorized |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@photo.jpg" \
  -F "documentType=photo" \
  -F "documentName=Passport Photo"
```

---

## 9. Health

### 9.1 GET /api/health

Health check endpoint. Verifies database connectivity.

**Auth:** None

**Response (200) -- Healthy:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-19T10:00:00.000Z",
  "version": "0.1.0",
  "uptime": 86400.5
}
```

**Response (503) -- Unhealthy:**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-03-19T10:00:00.000Z",
  "error": "Database connection failed"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

## 10. Webhooks

### 10.1 POST /api/webhooks/razorpay

Razorpay payment webhook. Verifies HMAC-SHA256 signature before processing.

**Auth:** HMAC signature via `x-razorpay-signature` header

**Configuration:** Requires `RAZORPAY_WEBHOOK_SECRET` environment variable.

**Request:** Raw JSON body from Razorpay

**Signature Verification:**
```
Expected = HMAC-SHA256(request_body, RAZORPAY_WEBHOOK_SECRET)
Compare with x-razorpay-signature header using crypto.timingSafeEqual()
```

**Handled Events:**
| Event | Action |
|-------|--------|
| `payment.captured` | Log successful payment (TODO: process payment) |
| `payment.failed` | Log failed payment |
| Other | Log and acknowledge |

**Response (200):**
```json
{ "status": "ok" }
```

**Error Codes:**
| Status | Error |
|--------|-------|
| 400 | Missing signature header |
| 401 | Invalid signature |
| 500 | Processing error |
| 503 | RAZORPAY_WEBHOOK_SECRET not configured |

**Example:**
```bash
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: COMPUTED_HMAC" \
  -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123"}}}}'
```

---

## Appendix: Common Error Response Format

All API errors return a consistent JSON shape:

```json
{
  "error": "Human-readable error description"
}
```

HTTP status codes follow REST conventions as documented per endpoint above.
