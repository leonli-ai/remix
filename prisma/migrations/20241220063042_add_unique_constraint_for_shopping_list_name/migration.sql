/*
  Warnings:

  - A unique constraint covering the columns `[customerId,name]` on the table `Shopping_List` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shopping_List_customerId_name_key" ON "Shopping_List"("customerId", "name");
