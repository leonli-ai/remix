/*
  Warnings:

  - A unique constraint covering the columns `[storeName,companyId,skuId,customerPartnerNumber]` on the table `Store_Company_Mapping` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Store_Company_Mapping_storeName_skuId_customerPartnerNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Store_Company_Mapping_storeName_companyId_skuId_customerPar_key" ON "Store_Company_Mapping"("storeName", "companyId", "skuId", "customerPartnerNumber");
