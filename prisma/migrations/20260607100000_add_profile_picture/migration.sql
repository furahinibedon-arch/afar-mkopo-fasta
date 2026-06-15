
-- AlterTable
ALTER TABLE "users" ADD COLUMN "profilePictureUrl" TEXT;

-- AlterTable for BorrowerProfile
ALTER TABLE "borrower_profiles" DROP CONSTRAINT "borrower_profiles_idNumber_key";
ALTER TABLE "borrower_profiles" RENAME COLUMN "idNumber" TO "nin";
ALTER TABLE "borrower_profiles" ALTER COLUMN "nin" DROP NOT NULL;

-- Add new optional columns to borrower_profiles
ALTER TABLE "borrower_profiles" ADD COLUMN "address" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "country" TEXT DEFAULT 'Tanzania';
ALTER TABLE "borrower_profiles" ADD COLUMN "region" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "district" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "borrower_profiles" ADD COLUMN "gender" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "maritalStatus" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "houseNumber" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "spouseName" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "businessName" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "businessLocation" TEXT;
ALTER TABLE "borrower_profiles" ADD COLUMN "businessSince" TEXT;

-- CreateTable
CREATE TABLE "borrower_documents" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "borrower_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "borrower_documents" ADD CONSTRAINT "borrower_documents_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrower_documents" ADD CONSTRAINT "borrower_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
