/*
  Warnings:

  - Added the required column `companyLocationId` to the `Shopping_List` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shopping_List" ADD COLUMN     "companyLocationId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT;
