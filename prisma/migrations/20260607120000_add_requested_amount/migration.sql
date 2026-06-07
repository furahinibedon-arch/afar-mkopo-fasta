-- AlterTable
ALTER TABLE "loans" ADD COLUMN "requestedAmount" DECIMAL(15,2);

-- Set requestedAmount for existing loans
UPDATE "loans" SET "requestedAmount" = "amount";

-- Make requestedAmount NOT NULL
ALTER TABLE "loans" ALTER COLUMN "requestedAmount" SET NOT NULL;
