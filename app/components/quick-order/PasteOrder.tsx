import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { FileText } from "lucide-react";
import _ from "lodash";
import { useGetProductVariantsByApi } from "~/hooks/use-product-search";
import type { FileListData, ValidationItem } from "~/types/quick-order";
import {
  flatSearchResultForUploadOrPasteV2,
  processFileListData,
} from "~/lib/quick-order";
import { useFormContext } from "react-hook-form";
import {
  fileHeaderCustomerPartnerNumber,
  fileHeaderProductSkuID,
  fileHeaderQty,
} from "~/constant/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PasteOrderProps {
  handleValidationList: (list: ValidationItem[]) => void;
  handleOpenChange: (isOpen: boolean) => void;
}

const PasteOrder = ({
  handleValidationList,
  handleOpenChange,
}: PasteOrderProps) => {
  const [inputValue, setInputValue] = useState("");
  const [pasteList, setPasteList] = useState<FileListData | null>(null);

  const form = useFormContext();
  const {
    storeName,
    shopifyCompanyId,
    shopifyCompanyLocationId,
    shopifyCustomerId,
  } = useShopifyInformation();

  const { t } = useTranslation();

  const ids = _.map(pasteList, (item) => item?.[fileHeaderProductSkuID]).map(
    (id: string | undefined) => id?.toString(),
  );

  const { data: productVariants } = useGetProductVariantsByApi({
    query: ids,
    storeName: storeName,
    customerId: shopifyCustomerId,
    companyLocationId: shopifyCompanyLocationId,
    companyId: shopifyCompanyId,
  });

  useEffect(() => {
    if (productVariants && pasteList) {
      processFileListData(
        pasteList,
        flatSearchResultForUploadOrPasteV2(productVariants.products),
        form,
        storeName,
        handleValidationList,
      );
      handleOpenChange(true);
    }
  }, [productVariants, pasteList]);

  const handleOnchange = (value: string) => {
    setInputValue(value);
  };

  const validateFormat = (input: string): boolean => {
    if (!input) {
      return false;
    }
    const lines = input.trim().split("\n");
    const regex = /^[\w/-]+[,;\s]+\d+$/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !regex.test(line)) {
        return false;
      }
    }
    return true;
  };

  const handleVerifyProducts = () => {
    if (validateFormat(inputValue)) {
      const rows = inputValue.split("\n").filter((item) => item !== "");
      const result: FileListData =
        _.map(rows, (row) => {
          const [productCode, quantity] = row.split(/[,; ]+/);
          return {
            [fileHeaderProductSkuID]: productCode.toString(),
            [fileHeaderCustomerPartnerNumber]: productCode.toString(),
            [fileHeaderQty]: Number(quantity),
          };
        }) || null;
      setPasteList(result);
    } else {
      toast.error(t("quick-order.paste-order.invalid-format-error"), {
        description: t("quick-order.paste-order.invalid-format-description"),
      });
    }
  };

  return (
    <div className="w-full lg:max-w-[305px] rounded-lg p-4 bg-gray-base">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-6 h-6" />
        <h2 className="text-base font-bold flex items-center gap-2 text-grey-dark">
          {t("quick-order.paste-order.title")}
        </h2>
      </div>

      <p className="text-sm text-grey-dark leading-[17px] mb-4">
        {t("quick-order.paste-order.instructions")}
      </p>
      <Textarea
        value={inputValue}
        onChange={(e) => handleOnchange(e.target.value)}
        className="min-h-[124px] mb-4 bg-white"
        placeholder={t("quick-order.paste-order.placeholder")}
      />
      <div className="text-center">
        <Button
          variant="outline"
          className="w-full rounded-[5px] h-[44px] border-outline max-w-[147px] font-bold text-outline"
          onClick={handleVerifyProducts}
        >
          {t("quick-order.paste-order.add-products-button")}
        </Button>
      </div>
    </div>
  );
};

export default PasteOrder;
