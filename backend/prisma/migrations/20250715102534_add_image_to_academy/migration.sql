/*
  Warnings:

  - Added the required column `image` to the `Academy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "image" TEXT NOT NULL;
