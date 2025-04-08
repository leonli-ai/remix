/*
  Warnings:

  - You are about to drop the `ShoppingList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShoppingListGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShoppingListItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkuPriceByLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingListGroup" DROP CONSTRAINT "ShoppingListGroup_parentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_shoppingListId_fkey";

-- DropTable
DROP TABLE "ShoppingList";

-- DropTable
DROP TABLE "ShoppingListGroup";

-- DropTable
DROP TABLE "ShoppingListItem";

-- DropTable
DROP TABLE "SkuPriceByLocation";

-- CreateTable
CREATE TABLE "Shopping_List_Group" (
    "id" BIGSERIAL NOT NULL,
    "customerId" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentGroupId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shopping_List_Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shopping_List" (
    "id" BIGSERIAL NOT NULL,
    "customerId" VARCHAR(255) NOT NULL,
    "groupId" BIGINT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "createBy" TEXT NOT NULL,
    "updateBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shopping_List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shopping_List_Item" (
    "id" BIGSERIAL NOT NULL,
    "shoppingListId" BIGINT NOT NULL,
    "productId" VARCHAR(255) NOT NULL,
    "productName" TEXT NOT NULL,
    "skuId" VARCHAR(255) NOT NULL,
    "customerPartnerNumber" TEXT,
    "quantity" INTEGER NOT NULL,
    "productImageUrl" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shopping_List_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sku_Price_By_Location" (
    "id" BIGSERIAL NOT NULL,
    "skuId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "companyLocation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sku_Price_By_Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shopping_List_Group_parentGroupId_idx" ON "Shopping_List_Group"("parentGroupId");

-- CreateIndex
CREATE INDEX "Shopping_List_groupId_idx" ON "Shopping_List"("groupId");

-- CreateIndex
CREATE INDEX "Shopping_List_Item_shoppingListId_idx" ON "Shopping_List_Item"("shoppingListId");

-- AddForeignKey
ALTER TABLE "Shopping_List_Group" ADD CONSTRAINT "Shopping_List_Group_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "Shopping_List_Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopping_List" ADD CONSTRAINT "Shopping_List_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Shopping_List_Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopping_List_Item" ADD CONSTRAINT "Shopping_List_Item_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "Shopping_List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
