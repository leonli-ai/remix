-- AlterTable
ALTER TABLE "Shopping_List" ALTER COLUMN "createBy" DROP NOT NULL,
ALTER COLUMN "updateBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Shopping_List_Item" ALTER COLUMN "productName" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL;
