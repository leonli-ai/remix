import { Button, Select } from "@shopify/polaris";
import { useState, useCallback, useMemo } from "react";
import {
  useAdminPortalCompanyList,
  useDownloadTemplate,
} from "~/hooks/use-customer-partner-number";
import { CustomDialog } from "../common/CustomDialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
interface DownloadTemplateProps {
  onCompanyChange?: (companyId: string) => void;
  storeName: string;
}

export function DownloadTemplate({
  onCompanyChange,
  storeName,
}: DownloadTemplateProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>("");
  const [format, setFormat] = useState<string>("xlsx");
  const [open, setOpen] = useState(false);
  const { data: companyList } = useAdminPortalCompanyList();
  const { mutate } = useDownloadTemplate();

  const handleSelectChange = useCallback(
    (value: string) => {
      setSelected(value);
      onCompanyChange?.(value);
    },
    [onCompanyChange],
  );

  const companyOptions =
    companyList?.map((company) => ({
      label: company.name,
      value: company.id,
    })) || [];

  const formatOptions = [
    { label: "XLSX", value: "xlsx" },
    { label: "CSV", value: "csv" },
  ];

  const handleDownloadClick = () => {
    mutate(
      { storeName, companyId: selected, format: format },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const dialogContent = useMemo(() => {
    return (
      <div className="flex flex-col lg:flex-row gap-2 mt-4">
        <div className="flex gap-2">
          <Select
            label=""
            options={companyOptions}
            onChange={handleSelectChange}
            value={selected}
            placeholder={t(
              "admin-portal.customer-part-number.download.company-placeholder",
            )}
          />
          <Select
            label=""
            options={formatOptions}
            onChange={(value) => setFormat(value)}
            value={format}
            placeholder={t(
              "admin-portal.customer-part-number.download.format-placeholder",
            )}
          />
        </div>
        <Button onClick={handleDownloadClick} disabled={!selected}>
          {t("admin-portal.customer-part-number.download.trigger")}
        </Button>
      </div>
    );
  }, [companyOptions, format, selected]);

  return (
    <CustomDialog
      trigger={
        <Button onClick={() => setOpen(true)}>
          {t("admin-portal.customer-part-number.download.trigger")}
        </Button>
      }
      title={t("admin-portal.customer-part-number.download.title")}
      content={dialogContent}
      open={open}
      onOpenChange={setOpen}
      className="w-fit"
    />
  );
}
