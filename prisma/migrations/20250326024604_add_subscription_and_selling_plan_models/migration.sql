-- CreateTable
CREATE TABLE "Selling_Plan" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "currencyCode" VARCHAR(10) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Selling_Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selling_Plan_Item" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "sellingPlanId" BIGINT NOT NULL,
    "variantId" VARCHAR(50) NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Selling_Plan_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Selling_Plan_Delivery_Policy" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "sellingPlanId" BIGINT NOT NULL,
    "offerDiscount" BOOLEAN NOT NULL DEFAULT false,
    "intervalValue" INTEGER NOT NULL,
    "intervalUnit" TEXT NOT NULL,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "deliveryAnchor" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Selling_Plan_Delivery_Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription_Contract" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "sellingPlanId" BIGINT,
    "companyId" TEXT NOT NULL,
    "companyLocationId" TEXT NOT NULL,
    "customerId" TEXT,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "intervalValue" INTEGER NOT NULL,
    "intervalUnit" TEXT NOT NULL,
    "deliveryAnchor" INTEGER,
    "nextOrderCreationDate" TIMESTAMP(3) NOT NULL,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "currencyCode" TEXT NOT NULL,
    "orderTotal" DECIMAL(10,2) NOT NULL,
    "poNumber" TEXT,
    "customerPaymentMethodId" TEXT,
    "shippingMethodId" VARCHAR(50),
    "shippingMethodName" VARCHAR(255),
    "shippingCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription_Contract_Line" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "subscriptionContractId" BIGINT NOT NULL,
    "variantId" VARCHAR(50) NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "customerPartnerNumber" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_Contract_Line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription_Order" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "subscriptionContractId" BIGINT NOT NULL,
    "shopifyOrderId" VARCHAR(50) NOT NULL,
    "orderNumber" VARCHAR(50) NOT NULL,
    "poNumber" VARCHAR(50),
    "orderTotal" DECIMAL(10,2),
    "status" VARCHAR(20),
    "orderedDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByName" TEXT,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Selling_Plan_Item_sellingPlanId_idx" ON "Selling_Plan_Item"("sellingPlanId");

-- CreateIndex
CREATE INDEX "Selling_Plan_Delivery_Policy_sellingPlanId_idx" ON "Selling_Plan_Delivery_Policy"("sellingPlanId");

-- CreateIndex
CREATE INDEX "Subscription_Contract_Line_subscriptionContractId_idx" ON "Subscription_Contract_Line"("subscriptionContractId");

-- CreateIndex
CREATE INDEX "Subscription_Order_subscriptionContractId_idx" ON "Subscription_Order"("subscriptionContractId");
