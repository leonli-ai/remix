import { Modal, Text, TextField } from "@shopify/polaris";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DeclineQuoteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (declineReason: string) => void;
  isLoading?: boolean;
}

export function DeclineQuoteModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: DeclineQuoteModalProps) {
  const { t } = useTranslation();
  const [declineReason, setDeclineReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!declineReason.trim()) {
      setError(t("admin-portal.quoteDetails.declineModal.reason-required"));
      return;
    }

    onConfirm(declineReason);
    setDeclineReason("");
    setError("");
  };

  const handleClose = () => {
    setDeclineReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("admin-portal.quoteDetails.declineModal.title")}
      primaryAction={{
        content: t("admin-portal.quoteDetails.declineModal.confirm"),
        onAction: handleConfirm,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: t("admin-portal.quoteDetails.declineModal.cancel"),
          onAction: handleClose,
        },
      ]}
    >
      <Modal.Section>
        <Text as="p" variant="bodyMd">
          {t("admin-portal.quoteDetails.declineModal.message")}
        </Text>
        <div className="mt-4">
          <TextField
            label={t("admin-portal.quoteDetails.declineModal.reason-label")}
            value={declineReason}
            onChange={setDeclineReason}
            multiline={3}
            autoComplete="off"
            error={error}
          />
        </div>
      </Modal.Section>
    </Modal>
  );
}

export default DeclineQuoteModal;
