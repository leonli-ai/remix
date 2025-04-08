import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import type { QuoteWithCustomer } from "~/types/quotes/quote.schema";
import { formatPrice } from "~/lib/utils";
import _ from "lodash";

interface QuoteDetailAddProductButtonProps {
  cloneData: QuoteWithCustomer;
  setCloneData: (data: QuoteWithCustomer) => void;
  isGetCustomerPartnerNumberLoading: boolean;
}

export default function QuoteDetailAddProductButton({
  cloneData,
  setCloneData,
  isGetCustomerPartnerNumberLoading,
}: QuoteDetailAddProductButtonProps) {
  const { t } = useTranslation();

  const handleAddProductButtonClick = () => {
    const newQuoteItems = [
      ...cloneData?.quoteItems,
      {
        id: _.uniqueId("quote-item-add-product-"),
        type: "add-product",
        quantity: 1,
        originalPrice: 0,
        offerPrice: 0,
        offerPriceShow: formatPrice(0, cloneData?.currencyCode || "USD", true),
        // need use variant to judge if it is valid
        variant: {
          id: undefined,
          title: "Add Product",
          sku: undefined,
          inventoryQuantity: undefined,
          metafield: {
            value: undefined,
          },
          price: undefined,
          quantityRule: undefined,
          product: undefined,
        },
      },
    ];
    setCloneData({
      ...cloneData,
      quoteItems: newQuoteItems,
    });
  };

  return (
    <div className="no-print">
      <Button
        variant={null}
        onClick={handleAddProductButtonClick}
        disabled={isGetCustomerPartnerNumberLoading}
        className="flex items-center gap-1 py-3 pl-2 font-bold text-primary-main"
      >
        <span className="text-lg">
          <Plus className="!size-5" strokeWidth={3} />
        </span>{" "}
        {t("request-for-quote.detail.table.add-product-button")}
      </Button>
    </div>
  );
}
