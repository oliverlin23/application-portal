-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "interestEssay" TEXT,
ADD COLUMN     "numTournaments" TEXT,
ADD COLUMN     "selfAptitudeAssessment" TEXT,
ADD COLUMN     "udlStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "yearsOfExperience" TEXT,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "gradeLevel" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "school" DROP NOT NULL;
