/*
  Warnings:

  - A unique constraint covering the columns `[shoppingListId,productId]` on the table `Shopping_List_Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shopping_List_Item_shoppingListId_productId_key" ON "Shopping_List_Item"("shoppingListId", "productId");
