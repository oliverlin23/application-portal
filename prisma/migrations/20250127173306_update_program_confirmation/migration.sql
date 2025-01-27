/*
  Warnings:

  - The values [NOT_STARTED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `experience` on the `Application` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'WAITLISTED', 'DENIED', 'WITHDRAWN', 'CONFIRMED', 'COMPLETED');
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "experience",
ADD COLUMN     "debateExperience" TEXT,
ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';

-- CreateTable
CREATE TABLE "ProgramConfirmation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "dietaryRestrictions" TEXT NOT NULL DEFAULT '',
    "medicalConditions" TEXT NOT NULL DEFAULT '',
    "healthInsuranceCarrier" TEXT NOT NULL DEFAULT '',
    "groupPolicyNumber" TEXT NOT NULL DEFAULT '',
    "liabilityWaiver" BOOLEAN NOT NULL,
    "medicalRelease" BOOLEAN NOT NULL,
    "mediaRelease" BOOLEAN NOT NULL,
    "programGuidelines" BOOLEAN NOT NULL,
    "financialAidRequest" BOOLEAN NOT NULL DEFAULT false,
    "additionalNotes" TEXT NOT NULL DEFAULT '',
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramConfirmation_applicationId_key" ON "ProgramConfirmation"("applicationId");

-- CreateIndex
CREATE INDEX "ProgramConfirmation_applicationId_idx" ON "ProgramConfirmation"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramConfirmation" ADD CONSTRAINT "ProgramConfirmation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
