import { useMemo, useState } from "react";
import { Outlet, Scripts, useLoaderData, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import {
  IndexTable,
  useIndexResourceState,
  Text,
  Card,
  Page,
  Link,
  EmptySearchResult,
  Button,
} from "@shopify/polaris";
import type { IndexTableHeading } from "@shopify/polaris/build/ts/src/components/IndexTable";
import type { NonEmptyArray } from "@shopify/polaris/build/ts/src/types";
import { CustomPagination } from "~/components/common/CustomPagination";
import { StatusTag } from "~/components/admin-portal/StatusTag";
import ChangeLanguageSelector from "~/components/admin-portal/ChangeLanguageSelctor";
import { QuotesFilter } from "~/components/admin-portal/QuotesFilter";
import { useQuotesList } from "~/hooks/use-quotes";
import { useRouteBreadcrumbs } from "~/hooks/use-route-breadcrumbs";
import { format } from 'date-fns'
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

const CustomerFormatter = (customer: any) => {
  if (customer?.firstName || customer?.lastName) {
    return `${customer?.firstName || ""} ${customer?.lastName || ""}`;
  }

  return "—";
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function Quotes() {
  const { shop: storeName } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const breadcrumbRoute = useRouteBreadcrumbs().slice(2);
  const navigate = useNavigate();

  const tableConfig = {
    resourceName: {
      singular: t("admin-portal.quotes.table.quote-list-singular"),
      plural: t("admin-portal.quotes.table.quote-list-plural"),
    },
    headings: [
      {
        title: t("admin-portal.quotes.table.quote-number"),
        key: "id",
        render: (value: any) => (
          <Text variant="bodyMd" fontWeight="bold" as="span">
            #{value}
          </Text>
        ),
      },
      {
        title: t("admin-portal.quotes.table.status"),
        key: "status",
        render: (value: any) => (
          <StatusTag status={typeof value === "string" ? value : undefined} />
        ),
      },
      {
        title: t("admin-portal.quotes.table.po-number"),
        key: "poNumber",
        render: (value: any) => value,
      },
      {
        title: t("admin-portal.quotes.table.created-at"),
        key: "createdAt",
        render: (value: any) => format(value, 'MM/dd/yyyy'),
      },
      {
        title: t("admin-portal.quotes.table.expiration-date"),
        key: "expirationDate",
        render: (value: any) => (value == null ? '-' : format(value, 'MM/dd/yyyy')),
      },
      {
        title: t("admin-portal.quotes.table.owner"),
        key: "customer",
        render: (value: any) => CustomerFormatter(value),
      },
      {
        title: "",
        key: "actions",
        render: (value: any, item: any) => (
          <Link
            dataPrimaryLink
            url={`/app/quotes/${item.id}?companyLocationId=${item.companyLocationId || ""}&customerId=${item.customer?.id || ""}`}
          >
            <Text fontWeight="bold" as="span">
              {t("admin-portal.quotes.table.details")}
            </Text>
          </Link>
        ),
      },
    ],
  };

  const [params, setParams] = useState({
    storeName,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    filter: {},
    sort: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
  });

  const { data, isLoading, isFetching } = useQuotesList(params);

  const emptyStateMarkup = (
    <EmptySearchResult
      title={t("admin-portal.quotes.empty-search-result.title")}
      description={t("admin-portal.quotes.empty-search-result.description")}
      withIllustration
    />
  );

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(
      data?.quotes?.map((item) => ({ id: String(item?.id) })) || [],
    );

  const rowMarkup = useMemo(() => {
    if (data?.quotes?.length === 0) return [];

    // Helper function to ensure safe rendering of cell values
    const renderCellValue = (value: any) => {
      if (value instanceof Date) return value.toLocaleString();
      return value;
    };

    return data?.quotes.map((item, index) => {
      return (
        <IndexTable.Row
          id={String(item.id)}
          key={item.id}
          selected={selectedResources.includes(String(item.id))}
          position={index}
        >
          {tableConfig.headings.map((heading) => (
            <IndexTable.Cell key={heading.key}>
              {heading.render
                ? heading.render(item[heading.key as keyof typeof item], item)
                : renderCellValue(item[heading.key as keyof typeof item])}
            </IndexTable.Cell>
          ))}
        </IndexTable.Row>
      );
    });
  }, [data?.quotes, selectedResources, tableConfig.headings]);

  const handleCreateNewQuote = () => {
    navigate("/app/quotes/create");
  };

  const handlePageChange = (page: number) => {
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
      },
    }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        pageSize: itemsPerPage,
      },
    }));
  };

  const tableHeadings = tableConfig.headings.map(({ title }) => ({ title }));

  return (
    <div>
      {breadcrumbRoute.length === 0 ? (
        <Page>
          <div className="flex justify-end mb-4">
            <ChangeLanguageSelector />
          </div>
          <Card>
            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={handleCreateNewQuote}>Create new Quote</Button>
            </div>
            <div className="mb-4">
              <QuotesFilter
                onFilter={(filter) => {
                  setParams((prev) => ({
                    ...prev,
                    filter,
                    pagination: {
                      ...prev.pagination,
                      page: 1,
                    },
                  }));
                }}
              />
            </div>
            <IndexTable
              selectable={false}
              loading={isLoading || isFetching}
              resourceName={tableConfig.resourceName}
              itemCount={data?.quotes?.length ?? 0}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              emptyState={emptyStateMarkup}
              onSelectionChange={handleSelectionChange}
              headings={tableHeadings as NonEmptyArray<IndexTableHeading>}
            >
              {rowMarkup}
            </IndexTable>
            {data?.totalCount && data?.totalCount > 0 && (
              <CustomPagination
                paginationText={
                  <div className="flex items-center">
                    {t("admin-portal.quotes.pagination.total-records", {
                      count: data?.totalCount || 0,
                    })}
                  </div>
                }
                currentPage={params.pagination.page}
                totalPages={
                  data?.totalCount
                    ? Math.ceil(data?.totalCount / params.pagination.pageSize)
                    : 0
                }
                itemsPerPage={params.pagination.pageSize}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </Card>
        </Page>
      ) : (
        <>
          <Outlet />
          <Scripts />
        </>
      )}
    </div>
  );
}
