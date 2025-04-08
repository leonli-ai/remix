import { useState } from "react";
import PasteOrder from "./PasteOrder";
import UploadOrder from "./UploadOrder";
import ImportValidationDialog from "./ImportValidationDialog";
import type { ValidationItem } from "~/types/quick-order";

export const QuickOrderSlider = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [validationList, setValidationList] = useState<ValidationItem[]>([]);

  const handleValidationList = (list: ValidationItem[]) => {
    setValidationList((pre) => [...pre, ...list]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleClose = () => {
    setOpen(false);
    setValidationList([]);
  };

  return (
    <div>
      <div className="space-y-5 mt-8 lg:mt-0">
        <UploadOrder
          handleValidationList={handleValidationList}
          handleOpenChange={handleOpenChange}
        />
        <PasteOrder
          handleValidationList={handleValidationList}
          handleOpenChange={handleOpenChange}
        />
        <ImportValidationDialog
          open={open}
          onClose={handleClose}
          items={validationList}
        />
      </div>
    </div>
  );
};
