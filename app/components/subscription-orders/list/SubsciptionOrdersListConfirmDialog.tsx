import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { useTranslation } from "react-i18next";

interface SubsciptionOrdersListConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOK: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
  type: "delete" | "skip-delivery" | "pause" | "resume" | "approve" | "decline";
}

export const SubsciptionOrdersListConfirmDialog = ({
  open,
  onOpenChange,
  onOK,
  onCancel,
  disabled,
  loading,
  type,
}: SubsciptionOrdersListConfirmDialogProps) => {
  const { t } = useTranslation();
  const i18nPrefix = "subscription-orders.common-actions";
  const config = {
    delete: {
      title: t(`${i18nPrefix}.delete.dialog.title`),
      description: t(`${i18nPrefix}.delete.dialog.description`),
      okText: t(`${i18nPrefix}.delete.dialog.confirm`),
    },
    "skip-delivery": {
      title: t(`${i18nPrefix}.skip-delivery.dialog.title`),
      description: t(`${i18nPrefix}.skip-delivery.dialog.description`),
      okText: t(`${i18nPrefix}.skip-delivery.dialog.confirm`),
    },
    pause: {
      title: t(`${i18nPrefix}.pause.dialog.title`),
      description: t(`${i18nPrefix}.pause.dialog.description`),
      okText: t(`${i18nPrefix}.pause.dialog.confirm`),
    },
    resume: {
      title: t(`${i18nPrefix}.resume.dialog.title`),
      description: t(`${i18nPrefix}.resume.dialog.description`),
      okText: t(`${i18nPrefix}.resume.dialog.confirm`),
    },
    approve: {
      title: t(`${i18nPrefix}.approve.dialog.title`),
      description: t(`${i18nPrefix}.approve.dialog.description`),
      okText: t(`${i18nPrefix}.approve.dialog.confirm`),
    },
    decline: {
      title: t(`${i18nPrefix}.decline.dialog.title`),
      description: t(`${i18nPrefix}.decline.dialog.description`),
      okText: t(`${i18nPrefix}.decline.dialog.confirm`),
    },
  };
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={config[type].title}
      description={config[type].description}
      onCancel={onCancel}
      onOK={onOK}
      okText={config[type].okText}
      okDisabled={disabled}
      okLoading={loading}
    />
  );
};
