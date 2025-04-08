/*
  Warnings:

  - You are about to drop the column `companyLocation` on the `Sku_Price_By_Location` table. All the data in the column will be lost.
  - Added the required column `companyLocationId` to the `Sku_Price_By_Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sku_Price_By_Location" DROP COLUMN "companyLocation",
ADD COLUMN     "companyLocationId" TEXT NOT NULL;
