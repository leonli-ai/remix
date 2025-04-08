/*
  Warnings:

  - A unique constraint covering the columns `[companyId,storeName,companyLocationId,customerId]` on the table `RDS_Company_Role_Assignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productVariantId` to the `Shopping_List_Item` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RDS_Company_Role_Assignment_companyId_storeName_companyLoca_key";

-- AlterTable
ALTER TABLE "Shopping_List_Item" ADD COLUMN     "productVariantId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RDS_Company_Role_Assignment_companyId_storeName_companyLoca_key" ON "RDS_Company_Role_Assignment"("companyId", "storeName", "companyLocationId", "customerId");
