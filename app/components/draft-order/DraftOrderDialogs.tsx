import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface DraftOrderDialogsProps {
  type: "reject" | "delete" | "location" | "approve";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  rejectNote?: string;
  onRejectNoteChange?: (value: string) => void;
  locationName?: string;
  onGoToHomepage?: () => void;
}

export function DraftOrderDialogs({
  type,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  rejectNote,
  onRejectNoteChange,
  locationName,
  onGoToHomepage,
}: DraftOrderDialogsProps) {
  const { t } = useTranslation();

  const dialogContent = {
    reject: {
      title: t("draft-order.dialog.reject-title"),
      description: t("draft-order.dialog.reject-description"),
      confirmText: t("draft-order.dialog.reject-confirm"),
    },
    delete: {
      title: t("draft-order.dialog.delete-title"),
      description: t("draft-order.dialog.delete-description"),
      confirmText: t("draft-order.dialog.delete-confirm"),
    },
    location: {
      title: t("draft-order.dialog.location-title"),
      description: t("draft-order.dialog.location-description", {
        locationName,
      }),
      confirmText: t("draft-order.dialog.location-confirm"),
    },
    approve: {
      title: t("draft-order.dialog.approve-title"),
      description: t("draft-order.dialog.approve-description"),
      confirmText: t("draft-order.dialog.approve-confirm"),
    },
  };

  const content = dialogContent[type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md px-14">
        <DialogHeader>
          <DialogTitle className="text-center mb-4 font-bold pt-5">
            {content.title}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "pb-11",
              type === "reject" ? "text-left" : "text-center",
            )}
          >
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {type === "reject" && (
          <div className="pb-4">
            <Textarea
              placeholder={t("draft-order.dialog.reject-placeholder")}
              value={rejectNote}
              onChange={(e) =>
                onRejectNoteChange?.(e.target.value.slice(0, 500))
              }
              className="min-h-[100px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {t("draft-order.dialog.reject-character-count", {
                count: rejectNote?.length || 0,
              })}
            </div>
          </div>
        )}

        <DialogFooter className="!flex-col-reverse gap-4 !space-x-0 pb-2">
          {type === "location" ? (
            <>
              <Button
                variant="outline"
                onClick={onGoToHomepage}
                className="h-11"
              >
                {t("draft-order.dialog.switch-account")}
              </Button>
              <Button variant="default" onClick={onConfirm} className="h-11">
                {content.confirmText}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} className="h-11">
                {t("draft-order.dialog.cancel")}
              </Button>
              <Button
                variant="default"
                onClick={onConfirm}
                disabled={
                  isPending || (type === "reject" && !rejectNote?.trim())
                }
                className="h-11"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  content.confirmText
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
