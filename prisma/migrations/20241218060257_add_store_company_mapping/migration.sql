-- CreateTable
CREATE TABLE "Store_Company_Mapping" (
    "id" SERIAL NOT NULL,
    "storeName" VARCHAR(255) NOT NULL,
    "skuId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "customerPartnerNumber" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_Company_Mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_Company_Mapping_storeName_skuId_customerPartnerNumber_key" ON "Store_Company_Mapping"("storeName", "skuId", "customerPartnerNumber");
