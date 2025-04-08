/*
  Warnings:

  - Added the required column `currencyCode` to the `Sku_Price_By_Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sku_Price_By_Location" ADD COLUMN     "currencyCode" VARCHAR(3) NOT NULL;
