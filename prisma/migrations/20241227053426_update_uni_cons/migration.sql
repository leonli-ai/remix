/*
  Warnings:

  - A unique constraint covering the columns `[companyId,storeName,companyLocationId,companyContactId]` on the table `RDS_Company_Role_Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RDS_Company_Role_Assignment_companyId_storeName_companyLoca_key";

-- CreateIndex
CREATE UNIQUE INDEX "RDS_Company_Role_Assignment_companyId_storeName_companyLoca_key" ON "RDS_Company_Role_Assignment"("companyId", "storeName", "companyLocationId", "companyContactId");
