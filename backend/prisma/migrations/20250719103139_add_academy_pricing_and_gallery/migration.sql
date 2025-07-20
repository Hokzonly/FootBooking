-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "monthlyPrice" INTEGER,
ADD COLUMN     "openingHours" TEXT;
