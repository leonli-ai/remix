-- AlterTable
ALTER TABLE "Subscription_Contract" ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "shippingMethodId" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Subscription_Schedule_Log" (
    "id" BIGSERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "subscriptionContractId" BIGINT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_Schedule_Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_Schedule_Log_subscriptionContractId_idx" ON "Subscription_Schedule_Log"("subscriptionContractId");
