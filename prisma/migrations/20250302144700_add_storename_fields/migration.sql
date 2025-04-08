-- AlterTable
ALTER TABLE "Shopping_List" ADD COLUMN "storeName" VARCHAR(255);

-- AlterTable
ALTER TABLE "Shopping_List_Group" ADD COLUMN "storeName" VARCHAR(255);

-- AlterTable
ALTER TABLE "Sku_Price_By_Location" ADD COLUMN "storeName" VARCHAR(255);

-- DropIndex
DROP INDEX "Shopping_List_customerId_name_companyLocationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Shopping_List_customerId_name_companyLocationId_storeName_key" ON "Shopping_List"("customerId", "name", "companyLocationId", "storeName");
