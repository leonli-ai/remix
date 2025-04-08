/*
  Warnings:

  - You are about to drop the column `customerId` on the `RDS_Company_Role_Assignment` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `RDS_Company_Role_Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RDS_Company_Role_Assignment" DROP COLUMN "customerId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT;
