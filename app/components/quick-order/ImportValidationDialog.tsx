import { cn } from "~/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import _ from "lodash";
import type { ValidationItem } from "~/types/quick-order";
import { useTranslation } from "react-i18next";

interface ImportValidationDialogProps {
  open: boolean;
  onClose: () => void;
  items: ValidationItem[];
}

export default function ImportValidationDialog({
  open,
  onClose,
  items,
}: ImportValidationDialogProps) {
  const { t } = useTranslation();
  const reverseItems = _.cloneDeep(items)?.reverse();
  const validItemsCount = reverseItems.length;

  const validItemsSuccessCount = items.filter((item) => item.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="">
          <div className="flex items-center justify-center">
            <DialogTitle className="text-lg font-bold pt-5">
              {t("quick-order.import-validation.title")}
            </DialogTitle>
          </div>
          <div className="flex flex-col text-primary-text gap-1 text-sm mt-6 text-center">
            <p>
              <span className="font-bold ">
                {t("quick-order.import-validation.items-count", {
                  count: validItemsCount,
                })}
              </span>
            </p>
            <p>
              <span className="font-bold ">
                {t("quick-order.import-validation.success-count", {
                  count: validItemsSuccessCount,
                })}
              </span>
            </p>
          </div>
          <div className="mt-8 max-h-72 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="w-[130px] font-semibold text-primary-text">
                    {t("quick-order.import-validation.product-number")}
                  </TableHead>
                  <TableHead className="w-[57px] font-semibold text-primary-text">
                    {t("quick-order.import-validation.quantity")}
                  </TableHead>
                  <TableHead className="w-[110px] font-semibold text-primary-text">
                    {t("quick-order.import-validation.uom")}
                  </TableHead>
                  <TableHead className="text-primary-text font-semibold">
                    {t("quick-order.import-validation.message")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reverseItems.map((item, index) => (
                  <TableRow
                    key={item.variantId}
                    className={cn(index % 2 === 0 ? "bg-gray-base" : "")}
                  >
                    <TableCell className={item.isValid ? "" : "text-warning"}>
                      {item.variantId}
                    </TableCell>
                    <TableCell className={item.isValid ? "" : "text-warning"}>
                      {item.quantity}
                    </TableCell>
                    <TableCell className={item.isValid ? "" : "text-warning"}>
                      {item.uom}
                    </TableCell>
                    <TableCell className={item.isValid ? "" : "text-warning"}>
                      {item.message}
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
