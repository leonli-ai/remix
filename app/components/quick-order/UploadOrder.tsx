import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { FileUpIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import * as XLSX from "xlsx";
import { useGetProductVariantsByApi } from "~/hooks/use-product-search";
import _ from "lodash";
import { useFormContext } from "react-hook-form";
import {
  fileHeaderCustomerPartnerNumber,
  fileHeaderProductSkuID,
  fileHeaderQty,
  MAX_FILE_SIZE,
} from "~/constant/quick-order";
import type {
  FileListData,
  ParsedData,
  ValidationItem,
} from "~/types/quick-order";
import {
  flatSearchResultForUploadOrPasteV2,
  processFileListData,
} from "~/lib/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { toast } from "sonner";
import quickOrderInfoIcon from "~/assets/icons/quick-order-info-icon.svg";
import { useTranslation } from "react-i18next";

interface UploadOrderProps {
  handleValidationList: (list: ValidationItem[]) => void;
  handleOpenChange: (isOpen: boolean) => void;
}

const UploadOrder = ({
  handleValidationList,
  handleOpenChange,
}: UploadOrderProps) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileListData, setFileListData] = useState<FileListData | null>(null);
  const [customerCodes, setCustomerCodes] = useState<FileListData>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useFormContext();

  const {
    storeName,
    shopifyCompanyId,
    shopifyCompanyLocationId,
    shopifyCustomerId,
  } = useShopifyInformation();
  const ids = _.map(fileListData, (item) => item?.[fileHeaderProductSkuID])
    .map((id: string | undefined) => id?.toString())
    .filter((id) => id !== undefined);
  const customerCodeIds = _.map(
    customerCodes,
    (item) => item?.[fileHeaderCustomerPartnerNumber] ?? "",
  ).filter((id) => id !== undefined);

  const { data: productVariants } = useGetProductVariantsByApi({
    query: [...ids, ...customerCodeIds],
    storeName: storeName,
    customerId: shopifyCustomerId,
    companyLocationId: shopifyCompanyLocationId,
    companyId: shopifyCompanyId,
  });

  useEffect(() => {
    if (productVariants && fileListData) {
      processFileListData(
        fileListData,
        flatSearchResultForUploadOrPasteV2(productVariants.products),
        form,
        storeName,
        handleValidationList,
      );
      handleOpenChange(true);
    }
  }, [productVariants, fileListData]);

  const validateFile = (file: File): boolean => {
    if (!file) {
      return false;
    }
    const allowedTypes = [
      "text/csv", // .csv
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "application/vnd.oasis.opendocument.spreadsheet", // .ods
    ];
    const allowedExtensions = [".csv", ".xlsx", ".xls", ".ods"];
    if (
      (!allowedTypes.includes(file.type) &&
        !allowedExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        )) ||
      file.size > MAX_FILE_SIZE
    ) {
      return false;
    }
    return true;
  };

  const parseFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as ParsedData;
      if (
        parsedData.length === 0 ||
        (parsedData.length === 1 && Object.keys(parsedData[0]).length === 0)
      ) {
        return;
      }

      // Assuming the first row is headers
      const headers = parsedData[0];
      const dataWithHeaders = parsedData.slice(1).map((row) => {
        return headers.reduce(
          (acc, header, index) => {
            acc[header] = row[index];
            return acc;
          },
          {} as { [key: string]: string | number },
        );
      });
      return dataWithHeaders;
    } catch (err) {
      console.error("File parsing error:", err);
    }
  };

  const handleValidateFailed = (isFileFormatError: boolean = false) => {
    toast.error(
      isFileFormatError
        ? "Invalid file format."
        : "Invalid file type. Please upload a .CSV or .XLSX file.",
    );
    setFile(null);
    setFileListData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileValidate = async (file: File) => {
    setFileListData(null);
    setCustomerCodes([]);
    // validate file pass
    if (validateFile(file)) {
      await parseFile(file).then((res) => {
        if (res) {
          const isAllCustomerCodes = res.every(
            (item) => !!item[fileHeaderCustomerPartnerNumber],
          );
          const isAllProductSkuID = res.every(
            (item) => !!item[fileHeaderProductSkuID],
          );
          const condition = isAllCustomerCodes
            ? fileHeaderCustomerPartnerNumber
            : isAllProductSkuID
              ? fileHeaderProductSkuID
              : "";
          switch (condition) {
            case fileHeaderCustomerPartnerNumber:
              const customerData = _.map(res, (item) => ({
                [fileHeaderCustomerPartnerNumber]:
                  item[fileHeaderCustomerPartnerNumber],
                [fileHeaderQty]: item[fileHeaderQty],
              }));
              setCustomerCodes(customerData as FileListData);
              setFileListData(customerData as FileListData);
              setFile(file);
              break;

            case fileHeaderProductSkuID:
              setFileListData(res as any);
              setFile(file);
              break;

            case "":
            default:
              handleValidateFailed(true);
              break;
          }
        } else {
          handleValidateFailed();
        }
      });
      // validate file failed
    } else {
      handleValidateFailed();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] as File;
    handleFileValidate(selectedFile);
  };

  const handleOrigEvent = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragOverAndEnter = (event: React.DragEvent<HTMLDivElement>) => {
    handleOrigEvent(event);
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    handleOrigEvent(event);
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    handleOrigEvent(event);
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    handleFileValidate(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full lg:max-w-[305px] rounded-lg p-4 bg-gray-base">
      <div className="mb-4">
        <h2 className="text-base font-bold flex items-center gap-2 text-grey-dark">
          <FileUpIcon className="w-6 h-6" />
          {t("quick-order.upload-order.title")}
        </h2>
      </div>

      <div
        className={`bg-white flex flex-col items-center justify-center border-2 border-dashed rounded px-[15px] text-center pt-[29px] pb-[15px] transition-colors duration-300 ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onDragOver={handleDragOverAndEnter}
        onDragEnter={handleDragOverAndEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <p className="text-sm text-[#002434] w-[206px]">
              {t("quick-order.upload-order.drag-drop", {
                fileTypes: ".CSV, .XLSX, .ODS",
              })}
            </p>

            <Button
              variant="outline"
              className="my-3 w-full rounded-[5px] h-[44px] border-outline max-w-[206px] font-bold text-outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("quick-order.upload-order.choose-file")}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="app-hidden"
              accept=".csv,.xls,.xlsx,.ods"
            />
          </>
        ) : (
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {file?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <div className="flex gap-2 text-primary-main mx-auto text-[13px] font-semibold py-2 cursor-pointer">
              <img
                src={quickOrderInfoIcon}
                alt="info icon"
                className="w-5 h-5"
              />
              <span>{t("quick-order.upload-order.file-structure-info")}</span>
            </div>
          </DialogTrigger>
          <DialogContent className="flex flex-col sm:max-w-md h-full lg:h-auto">
            <DialogHeader className="space-y-0 my-6">
              <DialogTitle className="font-bold text-center text-primary-text leading-[22px]">
                {t("quick-order.upload-order.import-title")}
              </DialogTitle>
            </DialogHeader>
            <div className="leading-[20px] text-black mb-6">
              {t("quick-order.upload-order.import-instructions")}
            </div>
            <ol className="list-decimal pl-4 space-y-4 text-sm text-primary-text">
              <li>
                {t("quick-order.upload-order.template-download", {
                  fileType: "CSV",
                })}
                {t("quick-order.upload-order.template-download", {
                  fileType: "XLSX",
                })}
                {t("quick-order.upload-order.template-download", {
                  fileType: "ODS",
                })}
              </li>
              <li>{t("quick-order.upload-order.enter-product-ids")}</li>
              <li>{t("quick-order.upload-order.save-and-upload")}</li>
            </ol>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UploadOrder;
