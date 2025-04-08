-- CreateTable
CREATE TABLE "RDS_Company_Contact_Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "RDS_Company_Contact_Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDS_Company_Role_Assignment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "companyContactId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "companyLocationId" TEXT,

    CONSTRAINT "RDS_Company_Role_Assignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RDS_Company_Role_Assignment" ADD CONSTRAINT "RDS_Company_Role_Assignment_companyContactId_fkey" FOREIGN KEY ("companyContactId") REFERENCES "RDS_Company_Contact_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
