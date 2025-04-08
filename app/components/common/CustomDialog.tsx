import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ReactNode, useState } from "react";

interface CustomDialogProps {
  trigger?: ReactNode;
  title?: string | ReactNode;
  content: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  titleClassName?: string;
}

export function CustomDialog({
  trigger,
  title,
  content,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  className,
  titleClassName,
}: CustomDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const onOpenChange = isControlled
    ? controlledOnOpenChange
    : setUncontrolledOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={className}>
        {title && (
          <DialogHeader>
            <DialogTitle className={titleClassName}>{title}</DialogTitle>
          </DialogHeader>
        )}
        {content}
      </DialogContent>
    </Dialog>
  );
}
