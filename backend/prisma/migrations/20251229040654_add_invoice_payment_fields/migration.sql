-- AlterTable
ALTER TABLE "public"."schools" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankBranch" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT '₦',
ADD COLUMN     "enableOnlinePayment" BOOLEAN DEFAULT true;
