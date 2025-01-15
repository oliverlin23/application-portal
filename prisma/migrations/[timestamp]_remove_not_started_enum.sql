-- Update the enum by recreating it without NOT_STARTED
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
CREATE TYPE "ApplicationStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ACCEPTED', 'WAITLISTED', 'DENIED', 'WITHDRAWN');
ALTER TABLE "Application" ALTER COLUMN status TYPE "ApplicationStatus" USING status::text::"ApplicationStatus";
DROP TYPE "ApplicationStatus_old"; 