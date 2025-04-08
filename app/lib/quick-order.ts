import { t } from "i18next";
import _ from "lodash";
import * as XLSX from "xlsx";
import {
  fileHeaderCustomerPartnerNumber,
  fileHeaderProductSkuID,
  fileHeaderQty,
} from "~/constant/quick-order";
import type { CartLineWithLineId } from "~/types/cart";
import { ProductSearchResponse } from "~/types/product-variant/product-variant-search.schema";
import type {
  CurrentLines,
  FileListData,
  QuickOrderFormSchema,
  SearchResult,
  ValidationItem,
} from "~/types/quick-order";

export function processFileListData(
  uploadOrPasteList: FileListData,
  data: any[],
  form: any,
  storeName: string,
  handleValidationList: (list: ValidationItem[]) => void,
) {
  const cloneReverseList = _.cloneDeep(uploadOrPasteList)?.reverse();
  cloneReverseList?.forEach((fileListItem) => {
    const lineId = _.uniqueId("upload_");
    const currentLines: CurrentLines = form.getValues("productLines");
    const customerCode =
      fileListItem[fileHeaderCustomerPartnerNumber]?.toString() ?? "";
    const productCode = fileListItem[fileHeaderProductSkuID]?.toString() ?? "";
    const productQuantity = fileListItem[fileHeaderQty];
    if (typeof productQuantity !== "number") {
      handleValidationList([
        {
          variantId: productCode,
          quantity: productQuantity,
          uom: "",
          message: t(
            "quick-order.import-validation.product-quantity-not-correct",
          ),
          isValid: false,
        },
      ]);
      return;
    }
    const variant = data?.find((dataItem: any) => {
      return (
        dataItem?.sku === productCode ||
        dataItem?.customerPartnerNumber === customerCode
      );
    });

    if (!variant) {
      handleValidationList([
        {
          variantId: productCode || customerCode,
          quantity: productQuantity,
          uom: "",
          message: t("quick-order.import-validation.product-was-not-found"),
          isValid: false,
        },
      ]);
    } else if (fileListItem[fileHeaderQty] > variant.quantityAvailable) {
      handleValidationList([
        {
          variantId: variant?.sku,
          quantity: productQuantity,
          uom: "",
          message: t("quick-order.import-validation.out-of-stock"),
          isValid: false,
        },
      ]);
    } else {
      const price = variant?.unitPrice || variant?.price;
      const { metafield } = variant;
      const uom = metafield?.value;
      handleValidationList([
        {
          variantId: variant?.sku,
          quantity: productQuantity,
          uom: uom ?? "",
          message: t("quick-order.import-validation.valid"),
          isValid: true,
        },
      ]);
      const existingLine = Object.entries(currentLines).find(
        ([_key, line]) =>
          line.product.variantId && line.product.sku === variant?.sku,
      );

      if (existingLine) {
        const [existingLineId, existingLineData] = existingLine;
        form.setValue("productLines", {
          ...currentLines,
          [existingLineId]: {
            ...existingLineData,
            quantity: existingLineData.quantity + fileListItem[fileHeaderQty],
          },
        });
      } else {
        const product = variant.product;
        const image = product.images.nodes?.[0]?.url || "";
        const updatedAt = product.updatedAt;
        const onlineStoreUrl = product.handle
          ? `${storeName}/products/${product.handle}`
          : "";
        const quantityRule = variant.quantityRule;
        form.setValue("productLines", {
          [lineId]: {
            product: {
              id: variant.product.id,
              variantId: variant.id,
              name: `${variant?.sku}-${variant.product.title}`,
              originalName: variant.product.title,
              sku: variant.sku,
              uom: [uom],
              price,
              quantityAvailable: variant.quantityAvailable,
              image,
              updatedAt,
              onlineStoreUrl,
              quantityRule,
            },
            quantity: fileListItem[fileHeaderQty],
            selectedUom: uom,
          },
          ...currentLines,
        });
      }
    }
  });
}

const downloadTemplate = (
  filename: string,
  content: BlobPart,
  mimeType: string,
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const handleDownloadDefaultTemplate = (
  fileType: "csv" | "xlsx" | "ods",
) => {
  let filename = "";
  let mimeType = "";

  switch (fileType) {
    case "csv":
      filename = "template.csv";
      mimeType = "text/csv";
      const csvContent = "Product Sku ID,Customer Partner Number,Qty";
      downloadTemplate(filename, csvContent, mimeType);
      break;
    case "xlsx":
      filename = "template.xlsx";
      mimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const xlsxWorksheet = XLSX.utils.aoa_to_sheet([
        ["Product Sku ID", "Customer Partner Number", "Qty"],
      ]);
      const xlsxWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(xlsxWorkbook, xlsxWorksheet, "Sheet1");
      const xlsxWbout = XLSX.write(xlsxWorkbook, {
        bookType: "xlsx",
        type: "array",
      });
      downloadTemplate(filename, xlsxWbout, mimeType);
      break;
    case "ods":
      filename = "template.ods";
      mimeType = "application/vnd.oasis.opendocument.spreadsheet";
      const odsWorksheet = XLSX.utils.aoa_to_sheet([
        ["Product Sku ID", "Customer Partner Number", "Qty"],
      ]);
      const odsWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(odsWorkbook, odsWorksheet, "Sheet1");
      const odsWbout = XLSX.write(odsWorkbook, {
        bookType: "ods",
        type: "array",
      });
      downloadTemplate(filename, odsWbout, mimeType);
      break;
    default:
      return;
  }
};

export function extractVariantId(id: string) {
  return id.replace(/gid:\/\/shopify\/ProductVariant\//, "");
}

export function extractCartId(id: string) {
  return id.replace(/gid:\/\/shopify\/Cart\//, "");
}

export function deduplicateCartLines(
  lines: CartLineWithLineId[],
): CartLineWithLineId[] {
  const lineIdCollection = lines
    .map((line) => {
      if (line.lineId) {
        return {
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
          lineId: line.lineId,
        };
      }
    })
    .filter((line) => line !== undefined);

  const uniqueLines = _.uniqBy(lines, "merchandiseId");
  const matchLineId = uniqueLines.map((line) => {
    const matchLine = lineIdCollection.find(
      (collection) => collection.merchandiseId === line.merchandiseId,
    );
    return {
      ...line,
      lineId: matchLine?.lineId,
    };
  });
  return matchLineId;
}

function setCartLineErrors(
  errors: Array<{ field: string[]; message: string }>,
  form: any,
  uniqueLines: CartLineWithLineId[],
) {
  errors.forEach((error) => {
    const lineIndex = error.field[1];
    const lineId = uniqueLines[Number(lineIndex)].lineId;
    if (lineId) {
      const fieldName = error.field[2];
      form.setError(`productLines.${lineId}.${fieldName}`, {
        message: error.message,
      });
    }
  });
}

export const handleAddToCartApiErrors = (
  errors: Array<{ field: string[]; message: string }>,
  form: any,
  linesCollectionForValidation: CartLineWithLineId[],
  refetchCart?: () => Promise<any>,
) => {
  if (refetchCart) {
    refetchCart().then((res) => {
      const alreadyInCart = res?.data?.lines?.nodes;
      const formatAlreadyInCart = alreadyInCart.map((item: any) => ({
        merchandiseId: item.merchandise.id,
        quantity: item.quantity,
      }));
      const totalLines = formatAlreadyInCart.concat(
        linesCollectionForValidation,
      );
      const uniqueLines = deduplicateCartLines(totalLines);
      setCartLineErrors(errors, form, uniqueLines);
    });
  } else {
    const uniqueLines = deduplicateCartLines(linesCollectionForValidation);
    setCartLineErrors(errors, form, uniqueLines);
  }
};

export const flatSearchResult = (
  products: SearchResult["products"],
  searchType: "VARIANTS_SKU" | "TITLE",
  searchQuery: string,
) => {
  const flatArray = _.flatMap(products, (product) => {
    const items = product.variants.nodes.map((variant) => {
      const { metafield } = variant;
      const price = variant?.unitPrice || variant?.price;
      const uom = metafield?.value || "";
      const image = product.images.nodes?.[0]?.url || "";
      const updatedAt = product.updatedAt;
      const onlineStoreUrl = product.onlineStoreUrl || "";
      const quantityRule = variant.quantityRule;
      const handle = product.handle;

      return {
        id: product.id,
        variantId: variant.id,
        name: product.title,
        sku: variant.sku,
        price,
        uom: [uom],
        description: product.description,
        quantityAvailable: variant.quantityAvailable,
        unitPriceMeasurement: variant.unitPriceMeasurement,
        image,
        updatedAt,
        onlineStoreUrl,
        quantityRule,
        handle,
      };
    });
    return items;
  });
  if (searchType === "VARIANTS_SKU") {
    return flatArray.filter((product) => product.sku === searchQuery);
  }
  return flatArray;
};

export const flatSearchResultV2 = (
  products: ProductSearchResponse["products"],
): QuickOrderFormSchema["productLines"][string]["product"][] => {
  const flatArray = _.flatMap(products, (product) => {
    const items = product.variants.nodes.map((variant) => {
      const { metafield } = variant;
      const price = variant.contextualPricing?.price || {};
      const uom = metafield?.value || "";
      const image = product.images.nodes?.[0]?.url || "";
      const updatedAt = product.updatedAt;
      const onlineStoreUrl = product.onlineStoreUrl || "";
      const quantityRule = variant.contextualPricing?.quantityRule || {};
      const handle = product.handle;

      return {
        id: product.id,
        variantId: variant.id,
        name: product.title,
        sku: variant.sku,
        price,
        targetPrice: price, // for request for quote
        uom: [uom],
        description: product.description,
        quantityAvailable: variant.sellableOnlineQuantity,
        unitPriceMeasurement: variant?.unitPriceMeasurement || {},
        image,
        updatedAt,
        onlineStoreUrl,
        quantityRule,
        handle,
      };
    });
    return items;
  });
  return flatArray;
};

export const flatSearchResultForUploadOrPaste = (
  products: SearchResult["products"],
  searchQuery: string,
) => {
  const flatArray = _.flatMap(products, (product) => {
    const items = product.variants.nodes.map((variant) => {
      const { metafield } = variant;
      const quantityRule = variant.quantityRule;
      return {
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        quantityAvailable: variant.quantityAvailable,
        price: variant?.price,
        unitPrice: variant?.unitPrice,
        metafield: metafield,
        quantityRule: quantityRule,
        product: product,
      };
    });
    return items;
  });

  return flatArray.map((item) => {
    if (searchQuery.split(" OR ").includes(item.sku)) {
      return item;
    }
    return null;
  });
};
export const flatSearchResultForUploadOrPasteV2 = (
  products: ProductSearchResponse["products"],
) => {
  const flatArray = _.flatMap(products, (product) => {
    const items = product.variants.nodes.map((variant) => {
      const { metafield } = variant;
      const quantityRule = variant.contextualPricing?.quantityRule;
      return {
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        quantityAvailable: variant.sellableOnlineQuantity,
        price: variant.contextualPricing?.price,
        targetPrice: variant.contextualPricing?.price, // for request for quote
        unitPrice: variant?.unitPrice,
        metafield: metafield,
        quantityRule: quantityRule,
        product: product,
        customerPartnerNumber: variant?.customerPartnerNumber,
      };
    });
    return items;
  });

  return flatArray;
};

export const filterValidLines = (
  values: QuickOrderFormSchema,
  {
    enableQuantityRule = true,
    enableAvailableQuantity = true,
  }: {
    enableQuantityRule?: boolean;
    enableAvailableQuantity?: boolean;
  } = {},
) => {
  const successLines: (QuickOrderFormSchema["productLines"][string] & {
    lineId: string;
  })[] = [];
  const errorLines: (QuickOrderFormSchema["productLines"][string] & {
    lineId: string;
    msg?: string;
  })[] = [];
  const successCollect = (
    line: QuickOrderFormSchema["productLines"][string],
    lineId: string,
  ) => {
    successLines.push({
      ...line,
      lineId: lineId,
    });
  };
  const errorCollect = (
    line: QuickOrderFormSchema["productLines"][string],
    lineId: string,
    msg?: string,
  ) => {
    errorLines.push({
      ...line,
      lineId: lineId,
      msg: msg,
    });
  };

  Object.entries(values.productLines || {}).forEach(([lineId, line]) => {
    const checkProperty = () => {
      return Boolean(
        line.product &&
          line.product.id &&
          line.product.variantId &&
          (line?.quantity || 0) > 0,
      );
    };
    const checkAvailableQuantity = () => {
      return (line?.quantity || 0) <= (line.product?.quantityAvailable || 0);
    };

    const checkQuantityRule = () => {
      const quantityRule = line.product?.quantityRule;
      const { minimum, maximum, increment } = quantityRule;
      if (minimum && (line?.quantity || 0) < minimum) {
        return {
          status: false,
          msg: t("quick-order.validate-action.min-quantity", {
            minQuantity: minimum,
          }),
        };
      }
      if (maximum && (line?.quantity || 0) > maximum) {
        return {
          status: false,
          msg: t("quick-order.validate-action.max-quantity", {
            maxQuantity: maximum,
          }),
        };
      }
      if (increment && (line?.quantity || 0) % increment !== 0) {
        return {
          status: false,
          msg: t("quick-order.validate-action.increment-quantity", {
            increment: increment,
          }),
        };
      }
      return {
        status: true,
      };
    };

    if (checkProperty()) {
      if (enableAvailableQuantity && !checkAvailableQuantity()) {
        errorCollect(
          line,
          lineId,
          t("quick-order.validate-action.out-of-stock", {
            maxQuantity: line.product?.quantityAvailable || 0,
          }),
        );
        return;
      }
      const { status, msg } = checkQuantityRule();
      if (enableQuantityRule && !status) {
        errorCollect(line, lineId, msg);
        return;
      }
      successCollect(line, lineId);
    } else {
      // only error when product is not empty
      if (line.product.variantId) {
        errorCollect(line, lineId);
      }
    }
  });

  return { successLines, errorLines };
};

export const createEmptyProductLine = () => {
  return {
    product: {
      id: null,
      variantId: null,
      name: "",
      sku: "",
      price: {
        amount: 0,
        currencyCode: "USD",
      },
      uom: [],
      description: "",
      quantityRule: {
        minimum: 1,
        maximum: null,
        increment: 1,
      },
    },
    quantity: null,
    selectedUom: "",
    targetPrice: "",
  };
};

export const getExistingLineWhenSelectProduct = (
  lines: QuickOrderFormSchema["productLines"],
  sku: string | undefined | null,
) => {
  return Object.entries(lines).find(
    ([_key, line]) => line.product.variantId && line.product.sku === sku,
  );
};

export const initialProductLines = () => {
  const lines = {};
  const emptyLength = 5;
  Array(emptyLength)
    .fill(null)
    .forEach(() => {
      const lineId = _.uniqueId("product_");

      const array = lines as Record<
        string,
        QuickOrderFormSchema["productLines"][string]
      >;
      array[lineId] = createEmptyProductLine();
    });
  return lines;
};

export const getValidQuantity = (
  quantity: number,
  increment: number,
  ceil?: boolean,
) => {
  return ceil
    ? Math.ceil((quantity + 1) / increment) * increment
    : Math.floor((quantity - 1) / increment) * increment;
};
