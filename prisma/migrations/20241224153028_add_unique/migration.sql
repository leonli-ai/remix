/*
  Warnings:

  - A unique constraint covering the columns `[customerId,name,companyLocationId]` on the table `Shopping_List` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Shopping_List_customerId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Shopping_List_customerId_name_companyLocationId_key" ON "Shopping_List"("customerId", "name", "companyLocationId");
