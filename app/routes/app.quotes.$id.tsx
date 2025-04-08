import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useParams, useSearchParams } from '@remix-run/react';
import {
  AutoSelection,
  BlockStack,
  Box,
  Button,
  Card,
  type ColumnContentType,
  Combobox,
  DataTable,
  DatePicker,
  Divider,
  Frame,
  Grid,
  Icon,
  InlineError,
  InlineStack,
  Listbox,
  Loading,
  Page,
  Popover,
  Text,
  TextField,
  Thumbnail,
} from '@shopify/polaris';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ActionModal from '~/components/admin-portal/ActionModal';
import type { ActionModalType } from '~/components/admin-portal/ActionModal';
import ChangeLanguageSelector from '~/components/admin-portal/ChangeLanguageSelctor';
import { StatusTag } from '~/components/admin-portal/StatusTag';
import { QUERY_ADMIN_PORTAL_QUOTES_LIST, QUERY_ADMIN_PORTAL_QUOTE_DETAILS } from '~/constant/react-query-keys';
import { useCustomerPartnerNumberBySkuMutation, useGetProductVariantsByApi } from '~/hooks/use-product-search';
import {
  useApproveQuote,
  useCancelQuote,
  useConvertQuoteToDraftOrder,
  useDeclineQuote,
  useDeleteQuote,
  useQuoteDetails,
  useUpdateQuoteItems,
} from '~/hooks/use-quotes';
import { formatPrice } from '~/lib/utils';
import { authenticate } from '~/shopify.server';

interface QuoteItemVariant {
  customerPartnerNumber?: string;
  id: string;
  sku: string;
  product: {
    id: string;
    title: string;
    images?: any[];
  };
  price?: {
    currencyCode: string;
  };
  metafield?: {
    value: string;
  };
}

interface QuoteItem {
  productId: string;
  variantId: string;
  quantity: number;
  originalPrice: number;
  offerPrice: number;
  description?: string | null;
  variant?: QuoteItemVariant;
  searchText?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function QuoteDetails() {
  const { shop: storeName } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const companyLocationId = searchParams.get('companyLocationId');
  const customerId = searchParams.get('customerId');
  const [modalType, setModalType] = useState<ActionModalType | null>(null);
  // Add state for item validation errors
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuoteDetails({
    storeName,
    quoteId: Number(id),
    companyLocationId: companyLocationId || '',
    customerId: customerId || '',
  });

  // Create local state for quote items that can be updated
  const [quoteItems, setQuoteItems] = useState(data?.quoteItems || []);

  // Create local state for editable fields with proper typing
  const [editableFields, setEditableFields] = useState({
    expirationDate: (data as any)?.expirationDate || null,
    poNumber: data?.poNumber || '',
    note: {
      id: '',
      content: '',
    },
  });
  const [datePickerActive, setDatePickerActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Now we can use searchQuery in the hook
  const { data: productVariantsData } = useGetProductVariantsByApi({
    query: [searchQuery],
    storeName,
    customerId: customerId || '',
    companyLocationId: companyLocationId || '',
    companyId: (data as any)?.companyLocationDetails?.company?.id || '',
  });

  const { mutateAsync: getCustomerPartnerNumber } = useCustomerPartnerNumberBySkuMutation();

  // Debounce search query updates to prevent excessive API calls
  const debouncedSetSearchQuery = useMemo(
    () =>
      _.debounce((value: string) => {
        setSearchQuery(value);
      }, 500),
    [],
  );

  // Update local state when the data changes
  useEffect(() => {
    if (data?.quoteItems) {
      setQuoteItems(data.quoteItems);
    }
    if (data) {
      const formateNote = (data as any).notes?.find((note: any) => note.noteType === data.status) || {
        id: '',
        content: '',
      };
      setEditableFields({
        expirationDate: (data as any).expirationDate || null,
        poNumber: data.poNumber || '',
        note: {
          id: formateNote?.id || '',
          content: formateNote?.noteContent || '',
        },
      });
    }
  }, [data]);

  const { mutate: cancelQuoteMutation, isPending: isCancelling } = useCancelQuote();

  const handleCancelQuote = (cancelReason?: string) => {
    cancelQuoteMutation(
      {
        storeName,
        quoteId: Number(id),
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
        cancelNote: cancelReason || 'Cancelled by admin',
      },
      {
        onSuccess: async (res: any) => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
          });

          if (res?.code === 200) {
            toast.success(t('admin-portal.quoteDetails.messages.cancel-success'));
          } else {
            toast.error(res?.message || t('admin-portal.quoteDetails.messages.cancel-error'));
          }
          setModalType(null);
        },
        onError: (error: any) => {
          toast.error(error?.message);
          setModalType(null);
        },
      },
    );
  };

  const handleQuantityChange = (value: string, itemIndex: number) => {
    setQuoteItems((prevItems) => {
      const newItems = [...prevItems];
      if (newItems[itemIndex]) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          quantity: parseInt(value) || 0,
        };
      }
      return newItems;
    });
  };

  const handleOfferPriceChange = (value: string, itemIndex: number) => {
    // Don't allow minus sign by removing it if present
    if (value.includes('-')) {
      value = value.replace(/-/g, '');
    }

    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      const formattedValue = value === '' ? 0 : parseFloat(value);
      setQuoteItems((prevItems) => {
        const newItems = [...prevItems];
        if (newItems[itemIndex]) {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            offerPrice: isNaN(formattedValue) ? 0 : formattedValue,
          };
        }
        return newItems;
      });
    }
  };

  const { mutate: declineQuoteMutation, isPending: isDeclining } = useDeclineQuote();

  const handleDeclineQuote = (declineReason: string) => {
    declineQuoteMutation(
      {
        storeName,
        quoteId: Number(id),
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
        rejectNote: declineReason,
      },
      {
        onSuccess: async (res: any) => {
          if (res?.code === 200) {
            toast.success(t('admin-portal.quoteDetails.messages.decline-success'));

            queryClient.invalidateQueries({
              queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS],
            });

            queryClient.invalidateQueries({
              queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
            });
          } else {
            toast.error(res?.message || t('admin-portal.quoteDetails.messages.decline-error'));
          }
          setModalType(null);
        },
        onError: (error: any) => {
          toast.error(error?.message || t('admin-portal.quoteDetails.messages.decline-error'));
        },
      },
    );
  };

  // Add validation function for quote items
  const validateQuoteItems = () => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    quoteItems.forEach((item, index) => {
      newErrors[index] = {};

      // Check if product is selected (validate both productId and variantId)
      if (!item.variant?.product?.id || !item.variant?.id) {
        newErrors[index].product = t('admin-portal.quoteDetails.errors.product-required');
        isValid = false;
      }

      // Check quantity
      if (!item.quantity || item.quantity <= 0) {
        newErrors[index].quantity = t('admin-portal.quoteDetails.errors.quantity-required');
        isValid = false;
      }

      // Check price
      if (item.offerPrice <= 0) {
        newErrors[index].offerPrice = t('admin-portal.quoteDetails.errors.price-required');
        isValid = false;
      }
    });

    // Update errors state
    setItemErrors(newErrors);

    return isValid;
  };

  const { mutate: updateQuoteItemsMutation, isPending: isUpdating } = useUpdateQuoteItems();

  // Update handleUpdateItem to include validation
  const handleUpdateItem = () => {
    // Validate items before submitting
    if (!validateQuoteItems()) {
      return;
    }

    const formattedQuoteItems = quoteItems.map((item: QuoteItem) => ({
      productId: item.variant?.product?.id || '',
      variantId: item.variant?.id || '',
      quantity: item.quantity,
      originalPrice: item.originalPrice,
      offerPrice: item.offerPrice,
      description: item.description,
    }));

    // Convert string ID to number or undefined for the API
    const note =
      editableFields?.note?.content === '' || editableFields?.note?.content === null
        ? {}
        : {
            id: editableFields?.note?.id ? Number(editableFields.note.id) : undefined,
            content: editableFields?.note?.content || '',
          };

    updateQuoteItemsMutation(
      {
        storeName,
        quoteId: Number(id),
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
        expirationDate: editableFields.expirationDate || '',
        poNumber: editableFields.poNumber || '',
        note,
        quoteItems: formattedQuoteItems,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || t('admin-portal.quoteDetails.messages.update-success'));
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
          });
        },
        onError: (error) => {
          toast.error(error?.message || t('admin-portal.quoteDetails.messages.update-error'));
        },
      },
    );
  };

  const { mutate: approveQuoteMutation, isPending: isApproving } = useApproveQuote();

  // Update handleApproveQuote to include validation
  const handleApproveQuote = (approveReason?: string) => {
    // Validate items before approving
    if (!validateQuoteItems()) {
      setModalType(null);
      return;
    }

    approveQuoteMutation(
      {
        storeName,
        quoteId: Number(id),
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
        approveNote: approveReason || 'Approved by admin',
      },
      {
        onSuccess: async (res: any) => {
          if (res?.code === 200) {
            toast.success(t('admin-portal.quoteDetails.messages.approve-success'));
          } else {
            toast.error(res?.message || t('admin-portal.quoteDetails.messages.approve-error'));
          }
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
          });
          setModalType(null);
        },
        onError: (error: any) => {
          toast.error(error?.message);
          setModalType(null);
        },
      },
    );
  };

  const { mutate: convertQuoteToDraftOrderMutation, isPending: isConverting } = useConvertQuoteToDraftOrder();

  const handleConvertQuoteToDraftOrder = (reason?: string) => {
    convertQuoteToDraftOrderMutation(
      {
        storeName,
        quoteId: Number(id),
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
        note: reason || '',
      },
      {
        onSuccess: async (res) => {
          if (res?.code === 200) {
            toast.success(t('admin-portal.quoteDetails.messages.convert-success'));
          } else {
            toast.error(res?.message || t('admin-portal.quoteDetails.messages.convert-error'));
          }
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTE_DETAILS],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
          });
          setModalType(null);
        },
        onError: (error) => {
          toast.error(error?.message);
          setModalType(null);
        },
      },
    );
  };

  const { mutate: deleteQuoteMutation, isPending: isDeleting } = useDeleteQuote();

  const handleDeleteQuote = () => {
    deleteQuoteMutation(
      {
        storeName,
        quoteIds: [Number(id)],
        companyLocationId: companyLocationId || '',
        customerId: customerId || '',
      },
      {
        onSuccess: async (res) => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_QUOTES_LIST],
          });

          toast.success(t('admin-portal.quoteDetails.messages.delete-success'));
          navigate('/app/quotes');
        },
        onError: (error) => {
          toast.error(error?.message || t('admin-portal.quoteDetails.messages.delete-error'));
        },
      },
    );
  };

  // Function to format date
  const formatDate = (date?: string | Date | null) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  };

  const toggleDatePicker = () => setDatePickerActive(!datePickerActive);

  const handleExpirationDateChange = (date: { start: Date }) => {
    setEditableFields((prev) => ({
      ...prev,
      expirationDate: date.start,
    }));
  };

  const removeProduct = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  // Modify the function to add a new product with search capability
  const handleProductSelect = async (itemIndex: number, selectedItem: any) => {
    const productVariant = selectedItem.product;
    const selectedVariantId = selectedItem.value;

    // Find the specific variant that was selected
    const variantNode = productVariant.variants?.nodes?.find((variant: any) => variant.id === selectedVariantId) || productVariant.variants?.nodes?.[0];

    const uom = variantNode?.metafield?.value || '-';
    const price = variantNode?.contextualPricing?.price?.amount || '-';

    const params = {
      skuIds: [variantNode.sku],
      storeName,
      companyId: (data as any)?.companyLocationDetails?.company?.id || '',
    };

    await getCustomerPartnerNumber(params).then((res) => {
      const customerPartnerNumber = res?.customerPartnerNumberDetails?.[0]?.customerPartnerNumber || '';

      const newItems = [...quoteItems];

      newItems[itemIndex] = {
        ...newItems[itemIndex],
        productId: productVariant.id,
        variantId: variantNode.id,
        quantity: 1,
        originalPrice: parseFloat(price) || 0,
        offerPrice: parseFloat(price) || 0,
        variant: {
          customerPartnerNumber,
          id: variantNode.id,
          sku: variantNode.sku || '',
          product: {
            id: productVariant.id,
            title: productVariant.title,
            images: selectedItem.product?.images?.nodes || [],
          },
          price: {
            currencyCode: variantNode?.contextualPricing?.price?.currencyCode || 'USD',
          },
          metafield: {
            value: uom,
          },
        },
      };

      setQuoteItems(newItems);
    });

    setSearchQuery('');
  };

  // Add function to update search query
  const updateSearchQuery = (value: string) => {
    debouncedSetSearchQuery(value);
  };

  // Format product options for the Combobox
  const productOptions = useMemo(() => {
    if (!productVariantsData?.products || productVariantsData.products.length === 0) {
      return [];
    }

    // Check if we're searching by SKU
    const isSkuSearch = searchQuery && searchQuery.trim() !== '';
    let allOptions: any[] = [];

    if (isSkuSearch) {
      // Try to find variants with matching SKU
      productVariantsData.products.forEach((product: any) => {
        if (product.variants?.nodes) {
          const matchingVariants = product.variants.nodes.filter(
            (variant: any) => variant.sku && variant.sku.toLowerCase().includes(searchQuery.toLowerCase()),
          );

          if (matchingVariants.length > 0) {
            // Add matching variants to options
            const variantOptions = matchingVariants.map((variant: any) => ({
              value: variant.id,
              label: product.title,
              product: product,
            }));
            allOptions = [...allOptions, ...variantOptions];
          }
        }
      });

      if (allOptions.length === 0) {
        productVariantsData.products.forEach((product: any) => {
          if (product.variants?.nodes) {
            const variantOptions = product.variants.nodes.map((variant: any) => ({
              value: variant.id,
              label: product.title,
              product: product,
            }));
            allOptions = [...allOptions, ...variantOptions];
          }
        });
      }

      return allOptions;
    }

    return allOptions;
  }, [productVariantsData?.products, searchQuery]);

  // Update the function to add a product with proper typing
  const addProduct = () => {
    const newItem: QuoteItem = {
      productId: '',
      variantId: '',
      quantity: 1,
      originalPrice: 0,
      offerPrice: 0,
      description: null,
      variant: {
        id: '',
        sku: '',
        product: {
          id: '',
          title: '',
        },
      },
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  // Fix searchText handling with proper typing
  const handleSearchTextChange = (value: string, index: number) => {
    setQuoteItems((prevItems) => {
      const newItems = [...prevItems];
      if (newItems[index]) {
        newItems[index] = {
          ...newItems[index],
          searchText: value,
        };
      }
      return newItems;
    });
    updateSearchQuery(value);
  };

  const gridConfig = [
    {
      label: t('admin-portal.quoteDetails.information.created-at'),
      value: format(data?.createdAt || new Date(), 'MM/dd/yyyy'),
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.first-name'),
      value: (data as any)?.customer?.firstName || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.last-name'),
      value: (data as any)?.customer?.lastName || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.email-address'),
      value: (data as any)?.customer?.email || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.phone-number'),
      value: (data as any)?.customer?.phone || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.company-name'),
      value: (data as any)?.companyLocationDetails?.company?.name || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.company-account'),
      value: (data as any)?.companyLocationDetails?.name || '-',
      editable: false,
      span: 1,
    },
    {
      label: t('admin-portal.quoteDetails.information.expiration-date'),
      value: editableFields.expirationDate ? format(editableFields.expirationDate, 'MM/dd/yyyy') : '-',
      editable: data?.status === 'Submitted',
      span: 1,
      field: (
        <Popover
          active={datePickerActive}
          autofocusTarget="none"
          onClose={toggleDatePicker}
          activator={
            <TextField
              label=""
              value={formatDate(editableFields.expirationDate)}
              onFocus={toggleDatePicker}
              autoComplete="off"
              placeholder={t('admin-portal.quoteCreate.expiration-date-placeholder')}
            />
          }
          preferredPosition="below"
          preferredAlignment="left"
        >
          <div className="p-4">
            <DatePicker
              selected={editableFields.expirationDate ? new Date(editableFields.expirationDate) : undefined}
              onChange={handleExpirationDateChange}
              onMonthChange={(month: number, year: number) => setEditableFields((prev) => ({ ...prev, expirationDate: new Date(year, month, 1) }))}
              month={editableFields.expirationDate ? new Date(editableFields.expirationDate).getMonth() : new Date().getMonth()}
              year={editableFields.expirationDate ? new Date(editableFields.expirationDate).getFullYear() : new Date().getFullYear()}
              disableDatesBefore={new Date()}
            />
          </div>
        </Popover>
      ),
    },
    {
      label: t('admin-portal.quoteDetails.information.po-number'),
      value: editableFields.poNumber || '-',
      editable: data?.status === 'Submitted',
      span: 1,
      field: (
        <TextField
          label=""
          value={editableFields.poNumber}
          onChange={(value) => setEditableFields((prev) => ({ ...prev, poNumber: value }))}
          autoComplete="off"
          placeholder={t('admin-portal.quoteCreate.po-number-placeholder')}
        />
      ),
    },
    {
      label: t('admin-portal.quoteDetails.information.notes'),
      value: editableFields?.note?.content || '-',
      editable: data?.status === 'Submitted',
      span: 3,
      field: (
        <TextField
          label=""
          value={editableFields?.note?.content}
          onChange={(value) =>
            setEditableFields((prev) => ({
              ...prev,
              note: {
                id: editableFields?.note?.id || '',
                content: value,
              },
            }))
          }
          multiline={4}
          autoComplete="off"
          placeholder={t('admin-portal.quoteCreate.notes-placeholder')}
        />
      ),
    },
  ];

  const tableConfig = {
    columnContentTypes: ['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text'] as ColumnContentType[],
    headings: [
      t('admin-portal.quoteDetails.products.columns.customer-product'),
      t('admin-portal.quoteDetails.products.columns.sku'),
      t('admin-portal.quoteDetails.products.columns.item'),
      t('admin-portal.quoteDetails.products.columns.qty'),
      t('admin-portal.quoteDetails.products.columns.uom'),
      t('admin-portal.quoteDetails.products.columns.target-price'),
      t('admin-portal.quoteDetails.products.columns.listed-price'),
      t('admin-portal.quoteDetails.products.columns.total-price'),
      '',
    ].map((heading, index) => {
      if (index === 0) {
        return (
          <div
            className="w-[80px] whitespace-normal break-words"
            key={heading}
          >
            <Text
              variant="bodyLg"
              fontWeight="regular"
              as="span"
            >
              {heading}
            </Text>
          </div>
        );
      }

      return (
        <Text
          key={heading}
          variant="bodyLg"
          fontWeight="regular"
          as="span"
        >
          {heading}
        </Text>
      );
    }),
    rows:
      quoteItems?.map((item, index) => {
        const textCell = (text: string) => (
          <Text
            variant="bodyLg"
            fontWeight="regular"
            as="span"
          >
            {text}
          </Text>
        );

        // Replace the itemCell with a Combobox for empty products
        const itemCell = !(item as any)?.variant?.product?.title ? (
          <div className="relative w-[200px]">
            <Combobox
              activator={
                <Combobox.TextField
                  autoComplete="off"
                  label=""
                  placeholder="Enter Product Name or Item Number"
                  value={(item as any)?.searchText || ''}
                  onChange={(value) => handleSearchTextChange(value, index)}
                  error={!!itemErrors[index]?.product}
                />
              }
              onScrolledToBottom={() => {}}
            >
              {productOptions.length > 0 ? (
                <div className="pb-4">
                  <Listbox
                    autoSelection={AutoSelection.None}
                    onSelect={(value) =>
                      handleProductSelect(
                        index,
                        productOptions.find((option: any) => option.value === value),
                      )
                    }
                  >
                    {productOptions.map((option: any) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </Listbox.Option>
                    ))}
                  </Listbox>
                </div>
              ) : null}
            </Combobox>
            {itemErrors[index]?.product && (
              <div className="absolute -bottom-6 left-0">
                <InlineError
                  message={itemErrors[index]?.product}
                  fieldID={`product-${index}`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-[60px] w-[60px]">
              <Thumbnail
                size="medium"
                source={(item as any)?.variant?.product?.images[0]?.url || undefined}
                alt={(item as any)?.variant?.product?.title || 'Product'}
              />
            </div>
            <span className="ml-2 max-w-[200px] overflow-hidden text-wrap">
              <Text
                variant="bodyLg"
                fontWeight="regular"
                as="span"
              >
                {(item as any)?.variant?.product?.title || ''}
              </Text>
            </span>
          </div>
        );

        const qtyCell = (
          <div className="flex max-w-[200px] items-center gap-2 py-4">
            {data?.status === 'Submitted' && (
              <div className="w-[100px]">
                <TextField
                  label=""
                  type="number"
                  autoComplete="off"
                  value={String(item?.quantity || 1)}
                  onChange={(value) => {
                    handleQuantityChange(value, index);
                  }}
                  min={1}
                  error={!!itemErrors[index]?.quantity}
                />
                {itemErrors[index]?.quantity && (
                  <InlineError
                    message={itemErrors[index]?.quantity}
                    fieldID={`quantity-${index}`}
                  />
                )}
              </div>
            )}
            <Text
              variant="bodyLg"
              fontWeight="regular"
              as="span"
            >
              {item?.quantity || 1} {item.quantity > 1 ? t('admin-portal.quoteDetails.order-summary.items') : t('admin-portal.quoteDetails.order-summary.item')}
            </Text>
          </div>
        );

        const offerPriceCell = (
          <div className="flex max-w-[120px] items-center">
            {data?.status === 'Submitted' ? (
              <div className="w-[120px]">
                <TextField
                  label=""
                  type="number"
                  value={String(item?.offerPrice || 0)}
                  onChange={(value) => {
                    handleOfferPriceChange(value, index);
                  }}
                  prefix="$"
                  autoComplete="off"
                  min={0}
                  error={!!itemErrors[index]?.offerPrice}
                />
                {itemErrors[index]?.offerPrice && (
                  <InlineError
                    message={itemErrors[index]?.offerPrice}
                    fieldID={`offer-price-${index}`}
                  />
                )}
              </div>
            ) : (
              <Text
                variant="bodyLg"
                fontWeight="regular"
                as="span"
              >
                {formatPrice(item?.offerPrice || 0, (item as any)?.variant?.price?.currencyCode || '')}
              </Text>
            )}
          </div>
        );

        const originalPriceCell = (
          <div className="flex max-w-[120px] items-center">
            <Text
              variant="bodyLg"
              fontWeight="regular"
              as="span"
            >
              {formatPrice(item?.originalPrice, (item as any)?.variant?.price?.currencyCode || '')}
            </Text>
          </div>
        );

        // Calculate total price
        const totalPrice = (item?.quantity || 0) * (item?.offerPrice || 0);
        const totalPriceCell = (
          <div className="flex max-w-[120px] items-center">
            <Text
              variant="bodyLg"
              fontWeight="regular"
              as="span"
            >
              {formatPrice(totalPrice, (item as any)?.variant?.price?.currencyCode || '')}
            </Text>
          </div>
        );

        return [
          textCell((item as any)?.variant?.customerPartnerNumber || '-'),
          textCell((item as any)?.variant?.sku || '-'),
          itemCell,
          qtyCell,
          textCell((item as any)?.variant?.metafield?.value || '-'),
          offerPriceCell,
          originalPriceCell,
          totalPriceCell,
          data?.status === 'Submitted' ? (
            <Button
              key={index}
              onClick={() => removeProduct(index)}
              variant="plain"
              icon={
                <Icon
                  source={() => (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  )}
                />
              }
            />
          ) : (
            <></>
          ),
        ];
      }) || [],
  };

  const handleModalAction = (reason?: string) => {
    if (modalType === 'decline') {
      handleDeclineQuote(reason || '');
    } else if (modalType === 'convert') {
      handleConvertQuoteToDraftOrder(reason || '');
    } else if (modalType === 'delete') {
      handleDeleteQuote();
    } else if (modalType === 'approve') {
      handleApproveQuote(reason || '');
    } else if (modalType === 'cancel') {
      handleCancelQuote(reason || '');
    }
  };

  if (isLoading) {
    return (
      <Frame>
        <Loading />
      </Frame>
    );
  }

  return (
    <Page
      backAction={{
        content: t('admin-portal.quoteDetails.buttons.back'),
        url: '/app/quotes',
        accessibilityLabel: t('admin-portal.quoteDetails.buttons.back'),
      }}
      title={t('admin-portal.quoteDetails.title', { id })}
    >
      <div className="mb-5 flex justify-end">
        <ChangeLanguageSelector />
      </div>
      <Card background="bg-surface-secondary">
        <div className="mb-4 flex items-center justify-between">
          <Text
            variant="headingMd"
            as="h5"
          >
            {t('admin-portal.quoteDetails.information.title')}
          </Text>
          <StatusTag status={data?.status} />
          {data?.status === 'Submitted' ? <Button onClick={() => setModalType('cancel')}>{t('admin-portal.quoteDetails.buttons.cancel')}</Button> : <div></div>}
        </div>

        <Grid columns={{ xs: 1, sm: 3, md: 4, lg: 4, xl: 4 }}>
          {gridConfig.map((item, index) => (
            <Grid.Cell
              key={index}
              columnSpan={{
                xs: 1,
                sm: item.span as 1 | 2 | 3 | 4 | 5 | 6 | undefined,
                md: item.span as 1 | 2 | 3 | 4 | 5 | 6 | undefined,
                lg: item.span as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | undefined,
                xl: item.span as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | undefined,
              }}
            >
              <Text
                variant="headingMd"
                fontWeight="bold"
                as="h4"
              >
                {item.label}
              </Text>
              {item.editable ? (
                item.field
              ) : (
                <Text
                  variant="headingMd"
                  fontWeight="regular"
                  as="span"
                  breakWord
                >
                  {item?.value || '-'}
                </Text>
              )}
            </Grid.Cell>
          ))}
        </Grid>
      </Card>

      <div className="mt-4">
        <Card>
          <BlockStack>
            <Box>
              <Text
                variant="headingMd"
                as="h6"
              >
                {t('admin-portal.quoteCreate.products')}
              </Text>
            </Box>
            <Box>
              <DataTable
                columnContentTypes={tableConfig.columnContentTypes}
                headings={tableConfig.headings}
                rows={tableConfig.rows}
                verticalAlign="middle"
              />

              {data?.status === 'Submitted' && (
                <Box padding="400">
                  <InlineStack
                    align="space-between"
                    blockAlign="center"
                    wrap={false}
                  >
                    <Button onClick={addProduct}>{t('admin-portal.quoteDetails.buttons.add-more-products')}</Button>
                  </InlineStack>
                </Box>
              )}
            </Box>
          </BlockStack>
        </Card>

        <div className="mt-4 flex justify-end">
          <Card background="bg-surface-secondary">
            <div className="mb-2 flex justify-between">
              <Text
                as="span"
                variant="bodyLg"
              >
                {t('admin-portal.quoteDetails.order-summary.item-count')}
              </Text>
              <Text
                as="span"
                variant="bodyLg"
              >
                {quoteItems?.length || 0}{' '}
                {quoteItems?.length === 1 ? t('admin-portal.quoteDetails.order-summary.item') : t('admin-portal.quoteDetails.order-summary.items')}
              </Text>
            </div>
            <Divider />
            <div className="my-2 flex justify-between">
              <Text
                as="span"
                variant="bodyLg"
                fontWeight="bold"
              >
                {t('admin-portal.quoteDetails.order-summary.subtotal')}
              </Text>
              <Text
                as="span"
                variant="bodyLg"
                fontWeight="bold"
              >
                {formatPrice(data?.subtotal || 0, data?.currencyCode || '')}
              </Text>
            </div>
            <Divider />
            <div className="my-2 flex items-start">
              <Icon
                source={() => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_4298_62599)">
                      <path
                        d="M8 0.25C3.72009 0.25 0.25 3.72134 0.25 8C0.25 12.2812 3.72009 15.75 8 15.75C12.2799 15.75 15.75 12.2812 15.75 8C15.75 3.72134 12.2799 0.25 8 0.25ZM8 3.6875C8.72487 3.6875 9.3125 4.27513 9.3125 5C9.3125 5.72487 8.72487 6.3125 8 6.3125C7.27513 6.3125 6.6875 5.72487 6.6875 5C6.6875 4.27513 7.27513 3.6875 8 3.6875ZM9.75 11.625C9.75 11.8321 9.58209 12 9.375 12H6.625C6.41791 12 6.25 11.8321 6.25 11.625V10.875C6.25 10.6679 6.41791 10.5 6.625 10.5H7V8.5H6.625C6.41791 8.5 6.25 8.33209 6.25 8.125V7.375C6.25 7.16791 6.41791 7 6.625 7H8.625C8.83209 7 9 7.16791 9 7.375V10.5H9.375C9.58209 10.5 9.75 10.6679 9.75 10.875V11.625Z"
                        fill="#005596"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4298_62599">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              />
              <div className="ml-1 max-w-[260px]">{t('admin-portal.quoteDetails.order-summary.taxes-notice')}</div>
            </div>

            <div className="mt-5">
              {data?.status === 'Submitted' && (
                <>
                  <div className="mb-5">
                    <Button
                      fullWidth
                      size="large"
                      variant="primary"
                      loading={isUpdating}
                      onClick={handleUpdateItem}
                    >
                      {t('admin-portal.quoteDetails.buttons.update-item')}
                    </Button>
                  </div>
                  <Button
                    fullWidth
                    size="large"
                    variant="primary"
                    loading={isApproving}
                    onClick={() => setModalType('approve')}
                  >
                    {t('admin-portal.quoteDetails.buttons.approve')}
                  </Button>
                  <div className="mt-5">
                    <Button
                      fullWidth
                      size="large"
                      onClick={() => setModalType('decline')}
                    >
                      {t('admin-portal.quoteDetails.buttons.decline')}
                    </Button>
                  </div>
                </>
              )}

              {data?.status === 'Approved' && (
                <Button
                  fullWidth
                  size="large"
                  variant="primary"
                  onClick={() => setModalType('convert')}
                >
                  {t('admin-portal.quoteDetails.buttons.convert')}
                </Button>
              )}

              {data?.status !== 'Submitted' && (
                <div className="mt-5">
                  <Button
                    fullWidth
                    size="large"
                    variant="primary"
                    onClick={() => navigate(`/app/quotes/create?resubmitQuoteId=${id}&customerId=${customerId}&companyLocationId=${companyLocationId}`)}
                  >
                    {t('admin-portal.quoteDetails.buttons.resubmit')}
                  </Button>
                </div>
              )}

              <div className="mt-5">
                <Button
                  fullWidth
                  size="large"
                  tone="critical"
                  onClick={() => setModalType('delete')}
                >
                  {t('admin-portal.quoteDetails.buttons.delete')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ActionModal
        open={modalType !== null}
        onClose={() => setModalType(null)}
        onConfirm={handleModalAction}
        type={modalType || 'decline'}
        isLoading={
          modalType === 'decline'
            ? isDeclining
            : modalType === 'convert'
              ? isConverting
              : modalType === 'delete'
                ? isDeleting
                : modalType === 'approve'
                  ? isApproving
                  : modalType === 'cancel'
                    ? isCancelling
                    : false
        }
        requireReason={modalType !== 'delete'}
      />
    </Page>
  );
}
