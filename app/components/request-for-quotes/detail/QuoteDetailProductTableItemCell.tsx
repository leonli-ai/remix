import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  useCustomerPartnerNumberBySkuMutation,
  useGetProductVariantsByApi,
} from "~/hooks/use-product-search";
import { extractVariantId, flatSearchResultV2 } from "~/lib/quick-order";
import { useShopifyInformation } from "~/lib/shopify";
import { cn } from "~/lib/utils";
import { QuickOrderFormSchema } from "~/types/quick-order";
import { QuoteWithCustomer } from "~/types/quotes/quote.schema";
import _ from "lodash";
import TableProductItem from "~/components/common/TableProdcutItem";

interface QuoteDetailProductTableItemCellProps {
  item: QuoteWithCustomer["quoteItems"][number];
  onSelect: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
    lineId: string,
  ) => void;
}

interface ProductSearchFieldProps {
  label?: string;
  className?: string;
  onSelect: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
  ) => void;
}

function QuoteProductSearchField({
  label,
  onSelect,
  className,
}: ProductSearchFieldProps) {
  const { t } = useTranslation();

  const {
    shopifyCompanyId,
    storeName,
    shopifyCustomerId,
    shopifyCompanyLocationId,
  } = useShopifyInformation();

  const [open, setOpen] = useState(false);

  const [productList, setProductList] = useState<
    QuickOrderFormSchema["productLines"][string]["product"][]
  >([]);

  const [searchQuery, setSearchQuery] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string>("");

  const emptyResultError = () => {
    setErrorMsg(t("quick-order.table.search-empty-result"));
    return setProductList([]);
  };

  const debouncedSearch = useCallback(
    _.debounce((query: string) => {
      setSearchQuery([query]);
    }, 500),
    [],
  );

  const handleSearch = async (query: string) => {
    if (query.length === 0) {
      setSearchQuery([]);

      setProductList([]);
      return;
    }

    // debounce search query
    debouncedSearch(query);
  };

  const { data: productVariants } = useGetProductVariantsByApi({
    query: searchQuery,
    storeName: storeName,
    customerId: shopifyCustomerId,
    companyLocationId: shopifyCompanyLocationId,
    companyId: shopifyCompanyId,
  });
  const { mutateAsync: getCustomerPartnerNumberBySku } =
    useCustomerPartnerNumberBySkuMutation();

  useEffect(() => {
    if (productVariants) {
      if (productVariants.products.length === 0) {
        emptyResultError();
        return;
      }
      setErrorMsg("");
      const results = flatSearchResultV2(productVariants.products);
      const filteredSkuResults = results.filter((result) => {
        return result.sku === searchQuery[0];
      });
      if (filteredSkuResults.length === 0) {
        const skus = results
          .map((result) => result?.sku)
          .filter(Boolean) as string[];
        getCustomerPartnerNumberBySku({
          storeName: storeName,
          companyId: shopifyCompanyId,
          skuIds: skus,
        })
          .then((res) => {
            if (res?.code !== 200) {
              return setProductList(results);
            }
            const customerPartnerNumberDetails =
              res?.customerPartnerNumberDetails;
            const matchedSku = customerPartnerNumberDetails?.find(
              (item) => item.customerPartnerNumber === searchQuery[0],
            )?.skuId;
            const filteredResults = results.filter((result) => {
              return result.sku === matchedSku;
            });

            if (filteredResults.length === 0) {
              return setProductList(results);
            }
            setProductList(filteredResults);
          })
          .catch((err) => {
            setProductList(results);
            console.error(err);
          });
      } else {
        setProductList(filteredSkuResults);
        return;
      }
      return;
    }
  }, [productVariants]);

  return (
    <div className={cn(className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <div className="space-y-1">
            {label && <label className="text-sm text-gray-500">{label}</label>}
            <Input
              type="text"
              value={inputValue}
              placeholder={t("quick-order.table.search-field-placeholder")}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleSearch(e.target.value);
                setOpen(true);
              }}
              autoComplete="off"
              className="bg-white px-[10px] text-ellipsis overflow-hidden whitespace-nowrap h-11 w-full"
            />
          </div>
        </PopoverTrigger>

        {productList.length > 0 && (
          <PopoverContent
            className="p-0 lg:w-96"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <Command>
              <CommandList>
                <CommandGroup className="p-0">
                  {productList.map((product) => (
                    <CommandItem
                      className="data-[selected=true]:bg-outline data-[selected=true]:text-white rounded-none"
                      key={`${product.id}-${product.variantId}`}
                      value={`${product.id}-${product.variantId}`}
                      onSelect={() => {
                        setInputValue(
                          `${extractVariantId(product.sku || "")}-${product.name}`,
                        );
                        onSelect(product);
                        setProductList([]);
                        setOpen(false);
                      }}
                    >
                      {extractVariantId(product.sku || "")}-{product.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      <div className="text-sm font-normal text-warning">{errorMsg}</div>
    </div>
  );
}

export const QuoteDetailProductTableItemCell = ({
  item,
  onSelect,
}: QuoteDetailProductTableItemCellProps) => {
  const handleSelect = (
    product: QuickOrderFormSchema["productLines"][string]["product"],
  ) => {
    onSelect(product, item.id);
  };
  if (item?.type === "data") {
    return (
      <TableProductItem
        imageSrc={item?.variant?.product?.images?.[0]?.url || ""}
        imageAlt={item?.variant?.product?.title || ""}
        title={item?.variant?.product?.title || ""}
        className="py-3"
      />
    );
  }

  return <QuoteProductSearchField onSelect={handleSelect} className="w-full" />;
};
