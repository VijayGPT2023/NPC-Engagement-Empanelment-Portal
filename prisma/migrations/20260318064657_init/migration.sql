-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'applicant',
    "office" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PostRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advertisementNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "functionalRole" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL,
    "numberOfPositions" INTEGER NOT NULL DEFAULT 1,
    "placeOfDeployment" TEXT NOT NULL,
    "minQualification" TEXT NOT NULL,
    "minExperienceYears" INTEGER NOT NULL,
    "maxAgeLimitYears" INTEGER,
    "remunerationRange" TEXT,
    "contractPeriod" TEXT,
    "eligibilityCriteria" TEXT NOT NULL,
    "workResponsibilities" TEXT NOT NULL,
    "termsAndConditions" TEXT NOT NULL DEFAULT '',
    "applicationDeadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EngagementApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postRequirementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Indian',
    "aadhaarNo" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "alternateContactNo" TEXT,
    "emailId" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "correspondenceAddress" TEXT NOT NULL,
    "postAppliedFor" TEXT NOT NULL,
    "isRetiredPerson" BOOLEAN NOT NULL DEFAULT false,
    "retirementDate" DATETIME,
    "lastOrganization" TEXT,
    "lastDesignation" TEXT,
    "ppoNumber" TEXT,
    "autoScreenScore" REAL,
    "autoScreenResult" TEXT,
    "autoScreenDetails" TEXT,
    "alsoApplyEmpanelment" BOOLEAN NOT NULL DEFAULT false,
    "empanelmentApplicationId" TEXT,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" DATETIME,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EngagementApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EngagementApplication_postRequirementId_fkey" FOREIGN KEY ("postRequirementId") REFERENCES "PostRequirement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EngagementApplication_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpanelmentApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Indian',
    "aadhaarNo" TEXT,
    "contactNo" TEXT NOT NULL,
    "alternateContactNo" TEXT,
    "emailId" TEXT NOT NULL,
    "personalAddress" TEXT NOT NULL,
    "categoryApplied" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "domains" TEXT NOT NULL,
    "areasOfExpertise" TEXT NOT NULL,
    "preferredOffice1" TEXT NOT NULL,
    "preferredOffice2" TEXT,
    "preferredOffice3" TEXT,
    "willingToWorkAnywhere" BOOLEAN NOT NULL DEFAULT false,
    "autoScreenScore" REAL,
    "autoScreenResult" TEXT,
    "autoScreenDetails" TEXT,
    "empanelmentLetterNo" TEXT,
    "empanelmentDate" DATETIME,
    "empanelmentValidTill" DATETIME,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" DATETIME,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmpanelmentApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" REAL,
    "cgpa" REAL,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT,
    CONSTRAINT "Qualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpanelmentQualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" REAL,
    "cgpa" REAL,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "groupAService" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT,
    CONSTRAINT "EmpanelmentQualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "remunerationPayBand" TEXT,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "documentId" TEXT,
    CONSTRAINT "Experience_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpanelmentExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "documentId" TEXT,
    CONSTRAINT "EmpanelmentExperience_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingConducted" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "trainingTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "trainingMode" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "numberOfParticipants" INTEGER,
    "documentId" TEXT,
    CONSTRAINT "TrainingConducted_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultancyProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "projectDescription" TEXT NOT NULL,
    "documentId" TEXT,
    CONSTRAINT "ConsultancyProject_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionResearchProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "projectDescription" TEXT NOT NULL,
    "documentId" TEXT,
    CONSTRAINT "ActionResearchProject_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "dateObtained" DATETIME NOT NULL,
    "validTill" DATETIME,
    "documentId" TEXT,
    CONSTRAINT "Certification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfessionalMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "membershipType" TEXT NOT NULL,
    "fromDate" DATETIME NOT NULL,
    "toDate" DATETIME,
    CONSTRAINT "ProfessionalMembership_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "keyDetails" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verificationRemarks" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmpanelmentDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "keyDetails" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "verificationRemarks" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmpanelmentDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScreeningReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewerId" TEXT NOT NULL,
    "applicationId" TEXT,
    "empanelmentApplicationId" TEXT,
    "applicationType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "remarks" TEXT,
    "score" REAL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScreeningReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScreeningReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScreeningReview_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PostRequirement_advertisementNo_key" ON "PostRequirement"("advertisementNo");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementApplication_applicationNo_key" ON "EngagementApplication"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentApplication_applicationNo_key" ON "EmpanelmentApplication"("applicationNo");
