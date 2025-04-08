import {
  Button,
  Card,
  ColumnContentType,
  DataTable,
  InlineGrid,
  InlineStack,
  Modal,
  Page,
  Select,
  Spinner,
  Text,
  Thumbnail,
} from "@shopify/polaris";
import _ from "lodash";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateOrder } from "~/hooks/use-po-automation";
import { useGetProductPriceByVariants } from "~/hooks/use-product-search";
import { useGetShippingMethods } from "~/hooks/use-shipping-method";
import { formatPrice } from "~/lib/utils";
import { CreateOrderRequest } from "~/types/order-management/create-order.schema";
import { VariantPricesResponse } from "~/types/product-variant/variant-prices.schema";
import { PoParserResponse } from "~/types/purchase-order/po-parser.schema";
import { EligibleShippingMethod } from "~/types/shipping/shipping-method.schema";
import ChangeLanguageSelector from "./ChangeLanguageSelctor";
import Decimal from "decimal.js";
interface PoAutomationPreviewProps {
  onBackAction: () => void;
  parserData: PoParserResponse["data"];
  storeName: string;
  reset: () => void;
  poFileData: {
    url: string;
    fileType: string;
  };
}

export function PoAutomationPreview({
  onBackAction,
  parserData: data,
  storeName,
  reset,
  poFileData,
}: PoAutomationPreviewProps) {
  const { t } = useTranslation();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  // location
  const location = data?.companyContactProfiles?.[0]?.company?.locations?.[0];

  // get location price
  const getLocationPrice = (
    productPrice: VariantPricesResponse,
    variantId: string,
  ) => {
    const locationPrice = productPrice?.variantPrices?.find(
      (variantPrice) => variantPrice?.id === variantId,
    )?.price;
    return locationPrice;
  };

  const getShippingMethodOptions = (
    dataShippingMethods: EligibleShippingMethod[],
    apiShippingMethods: EligibleShippingMethod[],
  ) => {
    const data =
      _.isArray(dataShippingMethods) && dataShippingMethods?.length > 0
        ? dataShippingMethods
        : apiShippingMethods;
    return data?.map((item) => {
      return {
        label: item?.name,
        value: item?.id,
      };
    });
  };
  const [modalOpen, setModalOpen] = useState(false);

  // product price
  const { data: productPrice, isLoading: isProductPriceLoading } =
    useGetProductPriceByVariants({
      variantIds: data?.products?.map((item) => item?.variant?.id),
      storeName: storeName,
      customerId: data?.customer?.id,
      companyLocationId: location?.id,
    });

  // order total
  const orderTotal = data?.products?.reduce((acc, item) => {
    const locationPrice = getLocationPrice(
      productPrice as VariantPricesResponse,
      item?.variant?.id,
    );
    return Decimal.add(acc, _.toNumber(locationPrice?.amount) || 0).toNumber();
  }, 0);

  // shipping method
  const { data: shippingMethods, isLoading: isShippingMethodsLoading } =
    useGetShippingMethods(
      {
        storeName: storeName,
        countryCode: location?.shippingAddress?.countryCode || "",
        provinceCode: location?.shippingAddress?.zoneCode || "",
        orderTotal: orderTotal || 0,
      },
      _.isArray(data?.shippingMethods) && data?.shippingMethods?.length === 0,
    );

  const shippingMethodsOptions = useMemo(() => {
    return getShippingMethodOptions(
      data?.shippingMethods || [],
      shippingMethods || [],
    );
  }, [data?.shippingMethods, shippingMethods]);

  // selected shipping method
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    string | undefined
  >();

  const GridItem = ({
    title,
    value,
  }: {
    title: string;
    value: string | React.ReactNode;
  }) => {
    return (
      <div className="break-words flex flex-col gap-1">
        <div className="font-bold">{title}</div>
        <div>{value || "-"}</div>
      </div>
    );
  };

  const tableConfig = {
    columnContentTypes: [
      "text",
      "text",
      "text",
      "text",
      "text",
      "text",
      "text",
    ] as ColumnContentType[],
    headings: [
      t("admin-portal.po-automation.preview.table.customer-product"),
      t("admin-portal.po-automation.preview.table.sku"),
      t("admin-portal.po-automation.preview.table.item"),
      t("admin-portal.po-automation.preview.table.qty"),
      t("admin-portal.po-automation.preview.table.uom"),
      t("admin-portal.po-automation.preview.table.price"),
      t("admin-portal.po-automation.preview.table.subtotal"),
    ].map((heading) => {
      return (
        <Text key={heading} variant="bodyLg" fontWeight="regular" as="span">
          {heading}
        </Text>
      );
    }),
    rows:
      data?.products?.map((item, index) => {
        const textCell = (text: string) => (
          <Text variant="bodyLg" fontWeight="regular" as="span">
            {text || "-"}
          </Text>
        );

        const itemCell = (
          <div className="flex items-center">
            <Thumbnail
              size="medium"
              source={(item as any)?.image?.url || undefined}
              alt={(item as any)?.title || "Product"}
            />
            <span className="max-w-[200px] text-wrap overflow-hidden ml-2">
              <Text variant="bodyLg" fontWeight="regular" as="span">
                {item?.title || ""}
              </Text>
            </span>
          </div>
        );

        const qtyCell = (
          <div className="flex items-center max-w-[120px] gap-2">
            <Text variant="bodyLg" fontWeight="regular" as="span">
              {item?.variant?.quantity || "0"}{" "}
              {item?.variant?.quantity > 1
                ? t("common.text.upper-items")
                : t("common.text.upper-item")}
            </Text>
          </div>
        );

        const locationPrice = getLocationPrice(
          productPrice as VariantPricesResponse,
          item?.variant?.id,
        );

        const priceCell = locationPrice ? (
          <div className="flex items-center max-w-[120px]">
            <Text variant="bodyLg" fontWeight="regular" as="span">
              {formatPrice(
                locationPrice?.amount || 0,
                locationPrice?.currencyCode || "",
              )}
            </Text>
          </div>
        ) : (
          <div className="flex items-center max-w-[120px]">
            <Text variant="bodyLg" fontWeight="regular" as="span">
              {t("admin-portal.po-automation.preview.table.invalid-price")}
            </Text>
          </div>
        );

        // Calculate total price
        const totalPrice = locationPrice
          ? (item?.variant?.quantity || 0) *
            (_.toNumber(locationPrice?.amount) || 0)
          : "-";
        const totalPriceCell = (
          <div className="flex items-center max-w-[120px]">
            <Text variant="bodyLg" fontWeight="regular" as="span">
              {_.isNumber(totalPrice)
                ? formatPrice(totalPrice, item?.variant?.currencyCode || "")
                : totalPrice}
            </Text>
          </div>
        );

        return [
          textCell(item?.variant?.customerPartnerNumber || "-"),
          textCell(item?.variant?.sku || "-"),
          itemCell,
          qtyCell,
          textCell(item?.variant?.customUom || "-"),
          priceCell,
          totalPriceCell,
        ];
      }) || [],
  };

  const ShippingAddress = () => {
    const address =
      data?.companyContactProfiles?.[0]?.company?.locations?.[0]
        ?.shippingAddress;
    return (
      <div>
        <div>
          {data?.companyContactProfiles?.[0]?.company?.name} {address?.address1}{" "}
          {address?.address2}
        </div>
        <div>
          {address?.country} {address?.city} {address?.province} {address?.zip}
        </div>
      </div>
    );
  };

  const handleToOrder = (shippingLine: CreateOrderRequest["shippingLine"]) => {
    const params: CreateOrderRequest = {
      storeName: storeName,
      customerId: data?.customer?.id,
      companyLocationId:
        data?.companyContactProfiles?.[0]?.company?.locations?.[0]?.id,
      items: data?.products?.map((item) => {
        const locationPrice = getLocationPrice(
          productPrice as VariantPricesResponse,
          item?.variant?.id,
        );
        return {
          variantId: item?.variant?.id,
          quantity: item?.variant?.quantity || 0,
          price: locationPrice?.amount ? _.toNumber(locationPrice?.amount) : 0,
        };
      }),
      currencyCode: data?.products?.[0]?.variant?.currencyCode || "",
      poNumber: data?.poNumber || "",
      note: data?.note || "",
      poLink: {
        url: poFileData?.url || "",
        fileType: poFileData?.fileType || "",
      },
      shippingLine,
    };
    createOrder(params)
      .then((res) => {
        if (res?.code === 200) {
          toast.success(res?.message);
          reset();
          onBackAction();
          return;
        }
        toast.error(res?.message);
        console.error("create order error", res);
      })
      .catch((err) => {
        console.error("create order error", err);
        toast.error(err?.message || t("common.text.error"));
      });
  };

  const handleSelectShippingMethod = () => {
    const resourses =
      _.isArray(data?.shippingMethods) && data?.shippingMethods?.length > 0
        ? data?.shippingMethods
        : shippingMethods;
    const findShippingMethod = (resourses || [])?.find(
      (item) => item?.id === selectedShippingMethod,
    );

    const { rateProvider } = findShippingMethod || {};
    const { definition, participant } = rateProvider || {};

    const priceObject = definition?.price || participant?.fixedFee;

    const shippingLine: CreateOrderRequest["shippingLine"] = {
      title: findShippingMethod?.name || "",
      priceWithCurrency: {
        amount: _.toNumber(priceObject?.amount) || 0,
        currencyCode: priceObject?.currencyCode || "",
      },
    };

    handleToOrder(shippingLine);
  };

  return (
    <Page
      title={t("admin-portal.po-automation.preview.title")}
      backAction={{
        id: "po-automation-preview",
        content: t("common.text.back"),
        accessibilityLabel: t("common.text.back"),
        onAction: () => {
          onBackAction();
        },
      }}
    >
      <Modal
        open={modalOpen}
        title={t(
          "admin-portal.po-automation.modal.choose-shipping-method.title",
        )}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <div className="p-6">
          <div className="text-gray-600 mb-2">
            {t(
              "admin-portal.po-automation.modal.choose-shipping-method.description",
            )}
          </div>
          <Select
            label={t(
              "admin-portal.po-automation.modal.choose-shipping-method.select-label",
            )}
            placeholder={t(
              "admin-portal.po-automation.modal.choose-shipping-method.select-placeholder",
            )}
            options={shippingMethodsOptions}
            value={selectedShippingMethod}
            onChange={(value) => setSelectedShippingMethod(value)}
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              onClick={handleSelectShippingMethod}
              disabled={!selectedShippingMethod || isPending}
              icon={isPending ? <Spinner size="small" /> : undefined}
            >
              {t(
                "admin-portal.po-automation.modal.choose-shipping-method.confirm",
              )}
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <ChangeLanguageSelector />
        </div>
        <Card>
          <InlineGrid columns={4} gap={"400"}>
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.first-name",
              )}
              value={data?.customer?.firstName}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.last-name",
              )}
              value={data?.customer?.lastName}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.email-address",
              )}
              value={data?.customer?.email}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.phone-number",
              )}
              value={data?.customer?.phone}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.company-account",
              )}
              value={location?.name}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.shipping-address",
              )}
              value={<ShippingAddress />}
            />
            <GridItem
              title={t(
                "admin-portal.po-automation.preview.information-card.po-number",
              )}
              value={data?.poNumber}
            />
          </InlineGrid>
        </Card>

        <Card>
          <DataTable
            columnContentTypes={tableConfig.columnContentTypes}
            headings={tableConfig.headings}
            rows={tableConfig.rows}
            verticalAlign="middle"
          />
        </Card>

        <InlineStack align="end">
          <Button
            onClick={() => setModalOpen(true)}
            icon={isPending ? <Spinner size="small" /> : undefined}
            disabled={
              isPending ||
              !data?.customer?.id ||
              !data?.products?.length ||
              !data?.companyContactProfiles?.[0]?.company?.locations?.[0]?.id ||
              isProductPriceLoading ||
              isShippingMethodsLoading
            }
          >
            {t("admin-portal.po-automation.preview.action-button")}
          </Button>
        </InlineStack>
      </div>
    </Page>
  );
}
