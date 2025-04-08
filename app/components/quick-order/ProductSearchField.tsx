import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormControl, FormItem, FormMessage } from "~/components/ui/form";
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
import type { QuickOrderFormSchema } from "~/types/quick-order";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
interface ProductSearchFieldProps {
  field: ControllerRenderProps<any, any>;
  lineId: string;
  onSelect: (
    product: QuickOrderFormSchema["productLines"][string]["product"],
    lineId: string,
  ) => void;
  label?: string;
  form: UseFormReturn<QuickOrderFormSchema>;
  companyLocationId?: string;
}

export function ProductSearchField({
  field,
  label,
  lineId,
  onSelect,
  form,
  companyLocationId,
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

  const [searchInfo, setSearchInfo] = useState({
    lineId: "",
    fieldName: "",
  });

  const emptyResultError = () => {
    form.setError(searchInfo.fieldName as any, {
      message: t("quick-order.table.search-empty-result"),
    });
    return setProductList([]);
  };

  const debouncedSearch = useCallback(
    _.debounce((query: string) => {
      setSearchQuery([query]);
    }, 500),
    [],
  );

  const handleSearch = async (
    query: string,
    lineId: string,
    fieldName: string,
  ) => {
    form.setValue(`productLines.${lineId}.product.id`, null);
    form.setValue(`productLines.${lineId}.product.variantId`, null);

    if (query.length === 0) {
      setSearchQuery([]);
      setSearchInfo({
        lineId: "",
        fieldName: "",
      });
      setProductList([]);
      return;
    }

    setSearchInfo({
      lineId,
      fieldName,
    });

    // debounce search query
    debouncedSearch(query);
  };

  const { data: productVariants } = useGetProductVariantsByApi({
    query: searchQuery,
    storeName: storeName,
    customerId: shopifyCustomerId,
    companyLocationId: companyLocationId || shopifyCompanyLocationId,
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
      form.clearErrors(searchInfo.fieldName as any);
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
    <FormItem>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <FormControl>
            <div className="space-y-1">
              {label && (
                <label className="text-sm text-gray-500">{label}</label>
              )}
              <Input
                type="text"
                {...field}
                placeholder={t("quick-order.table.search-field-placeholder")}
                onChange={(e) => {
                  field.onChange(e);
                  handleSearch(e.target.value, lineId, field.name);
                  setOpen(true);
                }}
                autoComplete="off"
                className="bg-white px-[10px] text-ellipsis overflow-hidden whitespace-nowrap h-11"
              />
            </div>
          </FormControl>
        </PopoverTrigger>

        {productList.length > 0 && (
          <PopoverContent
            className="p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
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
                        onSelect(product, lineId);
                        setSearchQuery([]);
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
      <FormMessage className="text-sm font-normal text-warning" />
    </FormItem>
  );
}
