-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherMotherSpouseName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
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
    "retirementDate" DATETIME,
    "lastOrganization" TEXT,
    "lastDesignation" TEXT,
    "ppoNumber" TEXT,
    "ppoDocPath" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileQualification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "universityInstitution" TEXT NOT NULL,
    "yearOfPassing" INTEGER NOT NULL,
    "marksPercentage" REAL,
    "cgpa" REAL,
    "isHighestQualification" BOOLEAN NOT NULL DEFAULT false,
    "certificatePath" TEXT,
    CONSTRAINT "ProfileQualification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "remunerationPayBand" TEXT,
    "dutiesDescription" TEXT NOT NULL,
    "sectorType" TEXT NOT NULL,
    "certificatePath" TEXT,
    CONSTRAINT "ProfileExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
