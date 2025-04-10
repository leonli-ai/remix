/*
  Warnings:

  - You are about to drop the column `amount` on the `CaptureSession` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `CaptureSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CaptureSession` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `PaymentSession` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `RefundSession` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `RefundSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `RefundSession` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `VoidSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaptureSession" DROP CONSTRAINT "CaptureSession_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "RefundSession" DROP CONSTRAINT "RefundSession_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "VoidSession" DROP CONSTRAINT "VoidSession_paymentId_fkey";

-- AlterTable
ALTER TABLE "CaptureSession" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "PaymentSession" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "customer",
DROP COLUMN "status",
DROP COLUMN "test";

-- AlterTable
ALTER TABLE "RefundSession" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "VoidSession" DROP COLUMN "status";
