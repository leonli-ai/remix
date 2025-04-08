import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
interface ImportValidationDialogProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export default function CustomerPartNumberImportValidationDialog({
  open,
  onClose,
  data,
}: ImportValidationDialogProps) {
  const { t } = useTranslation();
  const totalCount = useMemo(() => {
    return data?.totalProcessed ?? 0;
  }, [data]);

  const successCount = useMemo(() => {
    return data?.successCount ?? 0;
  }, [data]);

  const items = useMemo(() => {
    if (data && data.failedRecords) {
      const errorList = data.failedRecords.flatMap(
        (item: { errors: any[]; row: any }) =>
          item.errors.map((error: any) => ({
            message: error,
            location: item.row,
          })),
      );

      return errorList.reduce(
        (
          acc: { message: any; location: any[] }[],
          current: {
            message: any;
            location: any;
          },
        ) => {
          const existingError = acc.find(
            (err) => err.message === current.message,
          );
          if (existingError) {
            existingError.location.push(current.location);
          } else {
            acc.push({
              message: current.message,
              location: [current.location],
            });
          }
          return acc;
        },
        [],
      );
    }
    return [];
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div>
          <div className="flex items-center justify-center">
            <DialogTitle className="text-lg font-bold">
              {t("admin-portal.customer-part-number.import.title")}
            </DialogTitle>
          </div>
          <div className="flex flex-col text-primary-text gap-1 text-[16px] mt-6 text-center">
            <p>
              <span className="font-bold ">{totalCount}</span>{" "}
              {t("common.text.items")}
            </p>
            <p>
              <span className="font-bold ">{successCount}</span>{" "}
              {t("admin-portal.customer-part-number.import.success-count")}
            </p>
          </div>
          <div className="mt-8 max-h-72 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="w-[130px] font-semibold text-primary-text">
                    {t("admin-portal.customer-part-number.import.message")}
                  </TableHead>
                  <TableHead className="w-[57px] font-semibold text-primary-text">
                    {t("admin-portal.customer-part-number.import.row")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.message}>
                    <TableCell className={"text-red-500"}>
                      {item.message}
                    </TableCell>
                    <TableCell className={"text-red-500"}>
                      {item.location.join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
