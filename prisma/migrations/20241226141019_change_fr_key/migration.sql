-- DropForeignKey
ALTER TABLE "RDS_Company_Role_Assignment" DROP CONSTRAINT "RDS_Company_Role_Assignment_companyContactId_fkey";

-- AddForeignKey
ALTER TABLE "RDS_Company_Role_Assignment" ADD CONSTRAINT "RDS_Company_Role_Assignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RDS_Company_Contact_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
