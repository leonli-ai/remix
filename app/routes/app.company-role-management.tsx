import React, { useCallback, useState, useEffect, useMemo } from "react";
import {
  IndexTable,
  Card,
  Link,
  useIndexResourceState,
  Text,
  useBreakpoints,
  AppProvider,
  Page,
  TextField,
  Select,
  Pagination,
  EmptySearchResult,
} from "@shopify/polaris";
import type { Customer } from "~/hooks/use-customers";
import { useCustomers } from "~/hooks/use-customers";
import "@shopify/polaris/build/esm/styles.css";
// import { CustomModal } from '~/components/customer/modal';
import { CompanyTags } from "~/components/CompanyTags";
import { CustomModal } from "~/components/customer/modal";
import debounce from "lodash/debounce";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import ChangeLanguageSelector from "~/components/admin-portal/ChangeLanguageSelctor";
import { useTranslation } from "react-i18next";

const SEARCH_DELAY = 500;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function CustomerList() {
  const { t } = useTranslation();
  const { shop } = useLoaderData<typeof loader>();
  const {
    customers,
    isLoading,
    fetchCustomers,
    pagination: paginationData,
  } = useCustomers();
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | undefined
  >();

  const PAGE_SIZE_OPTIONS = [
    {
      label: t(
        "admin-portal.company-role-management.pagination.per-page-label",
        { count: 10 },
      ),
      value: "10",
    },
    {
      label: t(
        "admin-portal.company-role-management.pagination.per-page-label",
        { count: 20 },
      ),
      value: "20",
    },
    {
      label: t(
        "admin-portal.company-role-management.pagination.per-page-label",
        { count: 50 },
      ),
      value: "50",
    },
  ];

  useEffect(() => {
    fetchCustomers({
      pagination: { first: parseInt(pageSize, 10) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedFetch = useMemo(
    () =>
      debounce((value: string, size: string) => {
        setCurrentPage(1);
        fetchCustomers({
          searchQuery: value,
          pagination: { first: parseInt(size, 10) },
        });
      }, SEARCH_DELAY),
    [fetchCustomers],
  );

  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage && paginationData.endCursor) {
      setCurrentPage((prev) => prev + 1);
      fetchCustomers({
        searchQuery: searchValue,
        pagination: {
          first: parseInt(pageSize, 10),
          after: paginationData.endCursor,
        },
      });
    }
  }, [
    fetchCustomers,
    paginationData.hasNextPage,
    paginationData.endCursor,
    searchValue,
    pageSize,
  ]);

  const handlePreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage && paginationData.startCursor) {
      setCurrentPage((prev) => prev - 1);
      fetchCustomers({
        searchQuery: searchValue,
        pagination: {
          last: parseInt(pageSize, 10),
          before: paginationData.startCursor,
        },
      });
    }
  }, [
    fetchCustomers,
    paginationData.hasPreviousPage,
    paginationData.startCursor,
    searchValue,
    pageSize,
  ]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      debouncedFetch(value, pageSize);
    },
    [debouncedFetch, pageSize],
  );

  const handlePageSizeChange = useCallback(
    (value: string) => {
      setPageSize(value);
      setCurrentPage(1);
      fetchCustomers({
        searchQuery: searchValue,
        pagination: { first: parseInt(value, 10) },
      });
    },
    [fetchCustomers, searchValue],
  );

  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const { selectedResources } = useIndexResourceState(
    customers.map((customer) => ({ id: customer.id })),
  );

  const handleEditClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  }, []);

  const emptyStateMarkup = (
    <EmptySearchResult
      title={t("admin-portal.company-role-management.no-customers-found")}
      description={t(
        "admin-portal.company-role-management.no-customers-found-description",
      )}
      withIllustration
    />
  );

  const rowMarkup = useMemo(() => {
    if (customers.length === 0) return [];

    return customers.map((customer, index) => (
      <IndexTable.Row
        id={customer.id}
        key={customer.id}
        selected={selectedResources.includes(customer.id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text as="span" alignment="start">
            {customer.displayName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <CompanyTags profiles={customer.companyContactProfiles} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Link
            dataPrimaryLink
            url="#"
            onClick={() => handleEditClick(customer)}
          >
            <Text fontWeight="bold" alignment="end" as="span">
              {t("admin-portal.company-role-management.edit")}
            </Text>
          </Link>
        </IndexTable.Cell>
      </IndexTable.Row>
    ));
  }, [customers, handleEditClick, selectedResources]);

  return (
    <Page>
      <AppProvider i18n={{}}>
        <CustomModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCustomer(undefined);
          }}
          customer={selectedCustomer}
          shop={shop}
        />
        <div className="flex justify-end mb-4">
          <ChangeLanguageSelector />
        </div>
        <Card>
          <div className="flex justify-between items-end mb-4">
            <div className="w-1/3">
              <TextField
                label=""
                value={searchValue}
                placeholder={t(
                  "admin-portal.company-role-management.search-placeholder",
                )}
                onChange={handleSearchChange}
                autoComplete="off"
              />
            </div>
            <div className="w-40">
              <Select
                label=""
                options={PAGE_SIZE_OPTIONS}
                onChange={handlePageSizeChange}
                value={pageSize}
              />
            </div>
          </div>

          <div className="relative">
            <IndexTable
              condensed={useBreakpoints().smDown}
              resourceName={resourceName}
              itemCount={customers.length}
              loading={isLoading}
              selectable={false}
              emptyState={emptyStateMarkup}
              headings={[
                { title: t("admin-portal.company-role-management.table.name") },
                {
                  title: t(
                    "admin-portal.company-role-management.table.company",
                  ),
                },
                {
                  id: "actions",
                  hidden: false,
                  title: (
                    <Text as="span" alignment="end">
                      {t("admin-portal.company-role-management.table.action")}
                    </Text>
                  ),
                },
              ]}
            >
              {rowMarkup}
            </IndexTable>
            {/* {isLoading && (
              <div className="absolute inset-0 z-999 bg-white/50 flex items-center justify-center">
                <Spinner accessibilityLabel="Loading" size="large" />
              </div>
            )} */}
          </div>

          <div className="flex items-center justify-center mt-4">
            <Pagination
              hasPrevious={paginationData.hasPreviousPage}
              onPrevious={handlePreviousPage}
              hasNext={paginationData.hasNextPage}
              onNext={handleNextPage}
              label={t(
                "admin-portal.company-role-management.pagination.label",
                { page: currentPage },
              )}
            />
          </div>
        </Card>
      </AppProvider>
    </Page>
  );
}
