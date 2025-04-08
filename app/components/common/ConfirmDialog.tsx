import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onCancel: () => void;
  onOK: () => void;
  cancelText?: string;
  okText?: string;
  okDisabled?: boolean;
  okLoading?: boolean;
  classCollect?: {
    content?: string;
    description?: string;
    title?: string;
  };
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onCancel,
  onOK,
  cancelText,
  okText,
  okDisabled,
  okLoading,
  classCollect,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("w-[calc(100%-1rem)]", classCollect?.content)}
      >
        <DialogHeader>
          <DialogTitle className={cn(classCollect?.title)}>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription
          className={cn(
            "break-words overflow-y-auto max-h-[200px]",
            classCollect?.description,
          )}
        >
          {description}
        </DialogDescription>
        <div className="flex flex-col-reverse lg:flex-row justify-end gap-3">
          <Button
            variant="outline"
            className="px-4 py-2 rounded"
            onClick={onCancel}
          >
            {cancelText ?? t("common.text.cancel")}
          </Button>
          <Button
            className="px-4 py-2 rounded "
            onClick={onOK}
            disabled={okDisabled}
          >
            {okLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              (okText ?? t("common.text.confirm"))
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
