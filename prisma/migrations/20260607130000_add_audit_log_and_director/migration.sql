-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "loanId" TEXT,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable (add requestedAmount to loans - first make it optional, then update, then make required)
ALTER TABLE "loans" ADD COLUMN "requestedAmount" DECIMAL(15,2);

-- Copy existing amount to requestedAmount
UPDATE "loans" SET "requestedAmount" = "amount";

-- Now make requestedAmount required
ALTER TABLE "loans" ALTER COLUMN "requestedAmount" SET NOT NULL;
