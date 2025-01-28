-- CreateTable
CREATE TABLE "FinancialAidApplication" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "dependents" TEXT NOT NULL DEFAULT '',
    "householdIncome" TEXT NOT NULL DEFAULT '',
    "receivedAssistance" BOOLEAN NOT NULL DEFAULT false,
    "circumstances" TEXT NOT NULL,
    "willProvideReturns" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT DEFAULT 'PENDING',

    CONSTRAINT "FinancialAidApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAidApplication_applicationId_key" ON "FinancialAidApplication"("applicationId");

-- CreateIndex
CREATE INDEX "FinancialAidApplication_applicationId_idx" ON "FinancialAidApplication"("applicationId");

-- AddForeignKey
ALTER TABLE "FinancialAidApplication" ADD CONSTRAINT "FinancialAidApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
