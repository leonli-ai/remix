import { useNavigate } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { CustomPaginationNew } from "~/components/common/CustomPaginationNew";
import { FilterValues } from "~/components/common/DynamicFilterBuilder";
import { useGetQuotesList } from "~/hooks/use-quotes";
import { useAddLocalePath } from "~/hooks/utils.hooks";
import { RESUBMIT_QUOTE_ITEMS_STORAGE_KEY } from "~/lib/quote";
import { useShopifyInformation } from "~/lib/shopify";
import { FetchQuotesParams } from "~/types/quotes/quote.schema";
import QuoteListHeader from "./QuoteListHeader";
import QuotesTable from "./QuotesTable";
export default function QuotesList() {
  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();
  const handleShowCreateForm = () => {
    navigate(addLocalePath("/apps/customer-account/request-for-quote"));
  };

  const { storeName, shopifyCompanyLocationId } = useShopifyInformation();

  const [params, setParams] = useState<FetchQuotesParams>({
    companyLocationId: shopifyCompanyLocationId,
    storeName,
    sort: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    filter: {},
    pagination: {
      page: 1,
      pageSize: 10,
    },
  });

  const handleOnSearch = (filters: FilterValues) => {
    setParams({
      ...params,
      filter: filters,
      pagination: {
        ...params.pagination,
        page: 1,
      },
    });
  };

  const { data, isLoading } = useGetQuotesList(params);

  const itemsPerPageDefault = 10;
  const totalPages = useMemo(() => {
    return Math.ceil(
      (data?.totalCount ?? 0) / (data?.pageSize || itemsPerPageDefault),
    );
  }, [data]);

  const hasNextPage = useMemo(() => {
    return (data?.page || 1) < totalPages;
  }, [data?.page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return (data?.page || 1) > 1;
  }, [data?.page]);

  useEffect(() => {
    sessionStorage.removeItem(RESUBMIT_QUOTE_ITEMS_STORAGE_KEY);
  }, []);
  return (
    <div className="container mx-auto">
      <div className="space-y-5">
        <QuoteListHeader
          onSearch={handleOnSearch}
          totalItems={data?.totalCount || 0}
          onShowCreateForm={handleShowCreateForm}
        />
        <QuotesTable data={data?.quotes || []} isLoading={isLoading} />
        {(data?.totalCount || 0) > 10 && (
          <CustomPaginationNew
            hasNextButton={hasNextPage}
            hasPreviousButton={hasPreviousPage}
            currentPage={params.pagination?.page || 1}
            totalPages={totalPages}
            itemsPerPage={params.pagination?.pageSize || itemsPerPageDefault}
            onPageChange={(page) => {
              setParams({
                ...params,
                pagination: {
                  ...params.pagination,
                  page,
                },
              });
            }}
            onItemsPerPageChange={(pageSize) => {
              setParams({
                ...params,
                pagination: {
                  ...params.pagination,
                  pageSize,
                  page: 1,
                },
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
