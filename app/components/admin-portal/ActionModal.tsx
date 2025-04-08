import { Modal, Text, TextField } from "@shopify/polaris";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type ActionModalType = "decline" | "convert" | "delete" | "cancel" | "approve";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  type: ActionModalType;
  isLoading?: boolean;
  requireReason?: boolean;
}

export function ActionModal({
  open,
  onClose,
  onConfirm,
  type,
  isLoading = false,
  requireReason = false,
}: ActionModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError(t(getTranslationKey("reason-required")));
      return;
    }
    
    onConfirm(reason);
    setReason("");
    setError("");
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const getTranslationKey = (field: string) => {
    return `admin-portal.quoteDetails.actionModal.${type}.${field}`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t(getTranslationKey("title"))}
      primaryAction={{
        content: t(getTranslationKey("confirm")),
        onAction: handleConfirm,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: t(getTranslationKey("cancel")),
          onAction: handleClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p" variant="bodyMd">
          {t(getTranslationKey("message"))}
        </Text>
        {requireReason && (
          <div className="mt-4">
            <TextField
              label={''}
              value={reason}
              onChange={setReason}
              multiline={3}
              autoComplete="off"
              maxLength={500}
              error={error}
              placeholder={t(getTranslationKey("reason-placeholder"))}
            />
          </div>
        )}
      </Modal.Section>
    </Modal>
  );
}

export default ActionModal; 