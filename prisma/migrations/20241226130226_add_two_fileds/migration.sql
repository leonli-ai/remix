/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `RDS_Company_Contact_Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `RDS_Company_Role_Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RDS_Company_Role_Assignment" ADD COLUMN     "companyContactRoleAssignmentId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RDS_Company_Contact_Role_name_key" ON "RDS_Company_Contact_Role"("name");
