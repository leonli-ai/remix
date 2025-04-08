-- CreateTable
CREATE TABLE "ShoppingListGroup" (
    "id" BIGSERIAL NOT NULL,
    "customerId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentGroupId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingListGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" BIGSERIAL NOT NULL,
    "customerId" BIGINT NOT NULL,
    "groupId" BIGINT,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    "createBy" TEXT NOT NULL,
    "updateBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingListItem" (
    "id" BIGSERIAL NOT NULL,
    "shoppingListId" BIGINT NOT NULL,
    "productId" BIGINT NOT NULL,
    "productName" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "customerPartnerNumber" TEXT,
    "quantity" INTEGER NOT NULL,
    "productImageUrl" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkuPriceByLocation" (
    "id" BIGSERIAL NOT NULL,
    "skuId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "companyLocation" TEXT NOT NULL,

    CONSTRAINT "SkuPriceByLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShoppingListGroup_parentGroupId_idx" ON "ShoppingListGroup"("parentGroupId");

-- CreateIndex
CREATE INDEX "ShoppingList_groupId_idx" ON "ShoppingList"("groupId");

-- CreateIndex
CREATE INDEX "ShoppingListItem_shoppingListId_idx" ON "ShoppingListItem"("shoppingListId");

-- AddForeignKey
ALTER TABLE "ShoppingListGroup" ADD CONSTRAINT "ShoppingListGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "ShoppingListGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ShoppingListGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
