/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ACADEMY_ADMIN', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have updatedAt set to current timestamp
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP;

-- Now we can safely make updatedAt NOT NULL
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Convert existing role data to new enum
-- First, create a temporary column
ALTER TABLE "User" ADD COLUMN "role_new" "UserRole";

-- Update the temporary column based on existing role values
UPDATE "User" SET "role_new" = 
  CASE 
    WHEN "role" = 'admin' THEN 'ADMIN'::"UserRole"
    WHEN "role" = 'academy_admin' THEN 'ACADEMY_ADMIN'::"UserRole"
    ELSE 'USER'::"UserRole"
  END;

-- Drop the old role column and rename the new one
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";

-- Make the role column NOT NULL with default
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
