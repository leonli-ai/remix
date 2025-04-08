-- CreateEnum
CREATE TYPE "PoProcessType" AS ENUM ('OCR', 'IMAGE_ANALYSIS', 'PDF_EXTRACTION');

-- CreateEnum
CREATE TYPE "PoFileStatus" AS ENUM ('UPLOADED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PoFileOperationType" AS ENUM ('UPLOAD', 'QUEUE', 'PROCESS_START', 'PROCESS_COMPLETE', 'PROCESS_FAIL', 'RETRY', 'ARCHIVE', 'DELETE');

-- CreateTable
CREATE TABLE "Po_Files" (
    "id" SERIAL NOT NULL,
    "store_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "status" "PoFileStatus" NOT NULL DEFAULT 'UPLOADED',
    "process_type" "PoProcessType",
    "process_started_at" TIMESTAMP(3),
    "process_completed_at" TIMESTAMP(3),
    "process_duration" INTEGER,
    "error_code" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "recognition_confidence" DECIMAL(5,2),
    "extracted_text" TEXT,
    "parsed_data" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "company_id" VARCHAR(255),
    "company_location_id" VARCHAR(255),

    CONSTRAINT "Po_Files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Po_File_Histories" (
    "id" SERIAL NOT NULL,
    "po_file_id" INTEGER NOT NULL,
    "operation_type" "PoFileOperationType" NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "process_type" "PoProcessType",
    "process_details" JSONB,
    "error_code" TEXT,
    "error_message" TEXT,
    "error_details" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "Po_File_Histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Po_Files_store_name_idx" ON "Po_Files"("store_name");

-- CreateIndex
CREATE INDEX "Po_Files_status_idx" ON "Po_Files"("status");

-- CreateIndex
CREATE INDEX "Po_Files_created_at_idx" ON "Po_Files"("created_at");

-- CreateIndex
CREATE INDEX "Po_Files_process_type_idx" ON "Po_Files"("process_type");

-- CreateIndex
CREATE INDEX "Po_Files_company_id_idx" ON "Po_Files"("company_id");

-- CreateIndex
CREATE INDEX "Po_File_Histories_po_file_id_idx" ON "Po_File_Histories"("po_file_id");

-- CreateIndex
CREATE INDEX "Po_File_Histories_operation_type_idx" ON "Po_File_Histories"("operation_type");

-- CreateIndex
CREATE INDEX "Po_File_Histories_created_at_idx" ON "Po_File_Histories"("created_at");

-- CreateIndex
CREATE INDEX "Po_File_Histories_process_type_idx" ON "Po_File_Histories"("process_type");

-- AddForeignKey
ALTER TABLE "Po_File_Histories" ADD CONSTRAINT "Po_File_Histories_po_file_id_fkey" FOREIGN KEY ("po_file_id") REFERENCES "Po_Files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
