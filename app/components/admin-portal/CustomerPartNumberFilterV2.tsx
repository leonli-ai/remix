import { TextField } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { convertToGid } from "~/lib/utils";
import { useTranslation } from "react-i18next";
interface CustomerPartNumberFilterProps {
  onFilter: (filter: {
    skuId?: string;
    customerPartnerNumber?: string;
    productTitle?: string;
    companyId?: string;
  }) => void;
}

export function CustomerPartNumberFilterV2({
  onFilter,
}: CustomerPartNumberFilterProps) {
  const { t } = useTranslation();
  const [skuId, setSkuId] = useState("");
  const [customerPartnerNumber, setCustomerPartnerNumber] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [companyId, setCompanyId] = useState("");

  const handleSkuIdChange = useCallback((value: string) => setSkuId(value), []);

  const handleCustomerPartNumberChange = useCallback(
    (value: string) => setCustomerPartnerNumber(value),
    [],
  );

  const handleProductTitleChange = useCallback(
    (value: string) => setProductTitle(value),
    [],
  );

  const handleCompanyIdChange = useCallback(
    (value: string) => setCompanyId(value),
    [],
  );

  useEffect(() => {
    const newFilters = {
      skuId,
      customerPartnerNumber,
      productTitle,
      ...(companyId ? { companyId: convertToGid(companyId, "Company") } : {}),
    };
    onFilter(newFilters);
  }, [skuId, customerPartnerNumber, productTitle, companyId]);

  return (
    <div className="flex gap-2 justify-between">
      <TextField
        label={t("admin-portal.customer-part-number.filter.sku-id")}
        placeholder={t(
          "admin-portal.customer-part-number.filter.sku-id-placeholder",
        )}
        value={skuId}
        onChange={handleSkuIdChange}
        autoComplete="off"
        labelHidden
      />
      <TextField
        label={t(
          "admin-portal.customer-part-number.filter.customer-part-number",
        )}
        placeholder={t(
          "admin-portal.customer-part-number.filter.customer-part-number-placeholder",
        )}
        value={customerPartnerNumber}
        onChange={handleCustomerPartNumberChange}
        autoComplete="off"
        labelHidden
      />
      <TextField
        label={t("admin-portal.customer-part-number.filter.product-name")}
        placeholder={t(
          "admin-portal.customer-part-number.filter.product-name-placeholder",
        )}
        value={productTitle}
        onChange={handleProductTitleChange}
        autoComplete="off"
        labelHidden
      />
      <TextField
        label={t("admin-portal.customer-part-number.filter.company-id")}
        placeholder={t(
          "admin-portal.customer-part-number.filter.company-id-placeholder",
        )}
        value={companyId}
        onChange={handleCompanyIdChange}
        autoComplete="off"
        labelHidden
      />
    </div>
  );
}
