
-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'DELAYED');

-- CreateTable
CREATE TABLE "Compliance_Request" (
    "id" TEXT NOT NULL,
    "shop" VARCHAR(255) NOT NULL,
    "shopId" BIGINT NOT NULL,
    "requestType" "ComplianceType" NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3) NOT NULL,
    "customerId" BIGINT,
    "customerEmail" VARCHAR(255),
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "requestPayload" JSONB NOT NULL,
    "requestId" VARCHAR(255),
    "notes" TEXT,

    CONSTRAINT "Compliance_Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compliance_Log" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,

    CONSTRAINT "Compliance_Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Compliance_Request_shop_requestType_idx" ON "Compliance_Request"("shop", "requestType");

-- CreateIndex
CREATE INDEX "Compliance_Request_status_dueAt_idx" ON "Compliance_Request"("status", "dueAt");

-- CreateIndex
CREATE INDEX "Compliance_Log_requestId_idx" ON "Compliance_Log"("requestId");

-- AddForeignKey
ALTER TABLE "Compliance_Log" ADD CONSTRAINT "Compliance_Log_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Compliance_Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
