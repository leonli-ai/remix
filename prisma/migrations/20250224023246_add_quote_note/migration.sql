-- CreateTable
CREATE TABLE "QuoteNote" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "noteType" TEXT NOT NULL,
    "noteContent" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuoteNote" ADD CONSTRAINT "QuoteNote_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
