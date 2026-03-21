-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'applicant',
    "office" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Indian',
    "aadhaarNo" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "alternateContactNo" TEXT,
    "permanentAddress" TEXT NOT NULL,
    "correspondenceAddress" TEXT NOT NULL,
    "photoPath" TEXT,
    "cvPath" TEXT,
    "aadhaarDocPath" TEXT,
    "dobProofPath" TEXT,
    "isRetiredPerson" BOOLEAN NOT NULL DEFAULT false,
    "retirementDate" TIMESTAMP(3),
    "lastOrganization" TEXT,
    "lastDesignation" TEXT,
    "ppoNumber" TEXT,
    "ppoDocPath" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileQualification" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "certificatePath" TEXT,

    CONSTRAINT "ProfileQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "remunerationPayBand" TEXT,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "certificatePath" TEXT,

    CONSTRAINT "ProfileExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostRequirement" (
    "id" TEXT NOT NULL,
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
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementApplication" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postRequirementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
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
    "retirementDate" TIMESTAMP(3),
    "lastOrganization" TEXT,
    "lastDesignation" TEXT,
    "ppoNumber" TEXT,
    "autoScreenScore" DOUBLE PRECISION,
    "autoScreenResult" TEXT,
    "autoScreenDetails" TEXT,
    "alsoApplyEmpanelment" BOOLEAN NOT NULL DEFAULT false,
    "empanelmentApplicationId" TEXT,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentApplication" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
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
    "autoScreenScore" DOUBLE PRECISION,
    "autoScreenResult" TEXT,
    "autoScreenDetails" TEXT,
    "empanelmentLetterNo" TEXT,
    "empanelmentDate" TIMESTAMP(3),
    "empanelmentValidTill" TIMESTAMP(3),
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpanelmentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentQualification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "groupAService" BOOLEAN NOT NULL DEFAULT false,
    "documentId" TEXT,

    CONSTRAINT "EmpanelmentQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "remunerationPayBand" TEXT,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentExperience" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "EmpanelmentExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingConducted" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "trainingTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "trainingMode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "numberOfParticipants" INTEGER,
    "documentId" TEXT,

    CONSTRAINT "TrainingConducted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultancyProject" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "projectDescription" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "ConsultancyProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionResearchProject" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "clientOrganization" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "projectDescription" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "ActionResearchProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "dateObtained" TIMESTAMP(3) NOT NULL,
    "validTill" TIMESTAMP(3),
    "documentId" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalMembership" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "membershipType" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3),

    CONSTRAINT "ProfessionalMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
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
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpanelmentDocument" (
    "id" TEXT NOT NULL,
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
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpanelmentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningReview" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "applicationId" TEXT,
    "empanelmentApplicationId" TEXT,
    "applicationType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "remarks" TEXT,
    "score" DOUBLE PRECISION,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostRequirement_advertisementNo_key" ON "PostRequirement"("advertisementNo");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementApplication_applicationNo_key" ON "EngagementApplication"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "EmpanelmentApplication_applicationNo_key" ON "EmpanelmentApplication"("applicationNo");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileQualification" ADD CONSTRAINT "ProfileQualification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileExperience" ADD CONSTRAINT "ProfileExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementApplication" ADD CONSTRAINT "EngagementApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementApplication" ADD CONSTRAINT "EngagementApplication_postRequirementId_fkey" FOREIGN KEY ("postRequirementId") REFERENCES "PostRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementApplication" ADD CONSTRAINT "EngagementApplication_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentApplication" ADD CONSTRAINT "EmpanelmentApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentQualification" ADD CONSTRAINT "EmpanelmentQualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentExperience" ADD CONSTRAINT "EmpanelmentExperience_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingConducted" ADD CONSTRAINT "TrainingConducted_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultancyProject" ADD CONSTRAINT "ConsultancyProject_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionResearchProject" ADD CONSTRAINT "ActionResearchProject_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalMembership" ADD CONSTRAINT "ProfessionalMembership_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpanelmentDocument" ADD CONSTRAINT "EmpanelmentDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningReview" ADD CONSTRAINT "ScreeningReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningReview" ADD CONSTRAINT "ScreeningReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EngagementApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningReview" ADD CONSTRAINT "ScreeningReview_empanelmentApplicationId_fkey" FOREIGN KEY ("empanelmentApplicationId") REFERENCES "EmpanelmentApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

