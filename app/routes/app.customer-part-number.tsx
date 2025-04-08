import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { DownloadTemplate } from "~/components/admin-portal/DownloadTemplate";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { CustomPagination } from "~/components/common/CustomPagination";
import { MAX_FILE_SIZE } from "~/constant/quick-order";
import { QUERY_ADMIN_PORTAL_CUSTOMER_CODE_LIST } from "~/constant/react-query-keys";
import {
  useAdminPortalCustomerCodeList,
  useAdminPortalDeleteCustomerPartnerNumber,
  useAdminPortalUploadFile,
} from "~/hooks/use-customer-partner-number";
import { authenticate } from "~/shopify.server";
import { CustomerPartNumberFilterV2 } from "~/components/admin-portal/CustomerPartNumberFilterV2";
import { toast } from "sonner";
import CustomerPartNumberImportValidationDialog from "~/components/customer-part-number/ImportValidationDialog";
import ChangeLanguageSelector from "~/components/admin-portal/ChangeLanguageSelctor";
import { useTranslation } from "react-i18next";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function CustomerPartNumber() {
  const { t } = useTranslation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number[]>([]);
  const [importErrorData, setImportErrorData] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<"bulk" | "single">("bulk");
  const { shop } = useLoaderData<typeof loader>();
  const { mutate } = useAdminPortalUploadFile();
  const { mutate: deleteMutate } = useAdminPortalDeleteCustomerPartnerNumber();
  const [params, setParams] = useState({
    storeName: shop,
    pagination: {
      page: 1,
      pageSize: 10,
    },
    filter: {},
    sort: {},
  });
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } =
    useAdminPortalCustomerCodeList(params);

  const resourceName = {
    singular: "Customer PartnerNumber List",
    plural: "Customer Partner Number List",
  };

  const emptyStateMarkup = (
    <EmptySearchResult
      title={t("admin-portal.customer-part-number.empty-search-result.title")}
      description={t(
        "admin-portal.customer-part-number.empty-search-result.description",
      )}
      withIllustration
    />
  );

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(
      data?.items?.map((item) => ({ id: String(item?.id) })) || [],
    );

  const rowMarkup = useMemo(() => {
    if (data?.items.length === 0) return [];
    return data?.items.map(
      (
        {
          id,
          skuId,
          customerPartnerNumber,
          productTitle,
          companyId,
          companyName,
        },
        index,
      ) => (
        <IndexTable.Row
          id={String(id)}
          key={id}
          selected={selectedResources.includes(String(id))}
          position={index}
        >
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {customerPartnerNumber}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell className="!break-all !whitespace-normal !max-w-[400px]">
            {productTitle}
          </IndexTable.Cell>
          <IndexTable.Cell>{skuId}</IndexTable.Cell>
          <IndexTable.Cell>{companyId.split("/").slice(-1)[0]}</IndexTable.Cell>
          <IndexTable.Cell>{companyName}</IndexTable.Cell>
          <IndexTable.Cell>
            <Link
              dataPrimaryLink
              url="#"
              onClick={() => {
                setDeleteId([id]);
                setDeleteType("single");
                setOpenDeleteDialog(true);
              }}
            >
              <Text fontWeight="bold" as="span">
                {t("admin-portal.customer-part-number.delete.trigger")}
              </Text>
            </Link>
          </IndexTable.Cell>
        </IndexTable.Row>
      ),
    );
  }, [data?.items, selectedResources]);

  const validateFile = (file: File | undefined): boolean => {
    if (!file) {
      return false;
    }
    const allowedTypes = [
      "text/csv", // .csv
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
    const allowedExtensions = [".csv", ".xlsx"];
    if (
      (!allowedTypes.includes(file.type) &&
        !allowedExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext),
        )) ||
      file.size > MAX_FILE_SIZE
    ) {
      return false;
    }
    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;
    event.target.value = "";
    if (!validateFile(file)) {
      toast.error(
        t("admin-portal.customer-part-number.import.upload-file-error"),
      );
    } else {
      mutate(
        { storeName: shop, file },
        {
          onSuccess: async (data) => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_ADMIN_PORTAL_CUSTOMER_CODE_LIST],
            });
            if (data?.success && data?.failureCount === 0) {
              toast.success(
                t(
                  "admin-portal.customer-part-number.add-customer-part-number-success",
                ),
              );
            } else {
              setImportErrorData(data);
            }
          },
          onError: (error) => {
            toast.error(error.message);
          },
        },
      );
    }
  };

  const handleDelete = () => {
    deleteMutate(
      {
        storeName: shop,
        ids: deleteType === "bulk" ? selectedResources.map(Number) : deleteId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_ADMIN_PORTAL_CUSTOMER_CODE_LIST],
          });
          setOpenDeleteDialog(false);
          toast.success(
            t(
              "admin-portal.customer-part-number.delete-customer-part-number-success",
            ),
          );
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Page>
      <div className="flex justify-end mb-4">
        <ChangeLanguageSelector />
      </div>
      <Card>
        <div className="flex justify-end gap-2 mb-4">
          <DownloadTemplate storeName={shop} />
          <Button
            onClick={() => {
              setDeleteType("bulk");
              setOpenDeleteDialog(true);
            }}
            disabled={selectedResources.length === 0}
          >
            {t("admin-portal.customer-part-number.delete.bulk-delete-trigger")}
          </Button>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              {t("admin-portal.customer-part-number.import.trigger")}
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <CustomerPartNumberFilterV2
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
          loading={isLoading || isFetching}
          resourceName={resourceName}
          itemCount={data?.items?.length ?? 0}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          emptyState={emptyStateMarkup}
          onSelectionChange={handleSelectionChange}
          headings={[
            {
              title: t(
                "admin-portal.customer-part-number.table.customer-part-number",
              ),
            },
            {
              title: t("admin-portal.customer-part-number.table.product-name"),
            },
            { title: t("admin-portal.customer-part-number.table.sku-id") },
            { title: t("admin-portal.customer-part-number.table.company-id") },
            {
              title: t("admin-portal.customer-part-number.table.company-name"),
            },
            { title: t("admin-portal.customer-part-number.table.actions") },
          ]}
        >
          {rowMarkup}
        </IndexTable>
        <CustomPagination
          paginationText={
            <div className="flex items-center">
              {t("admin-portal.customer-part-number.pagination.total-records", {
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
          onPageChange={(page) => {
            setParams((prev) => ({
              ...prev,
              pagination: {
                ...prev.pagination,
                page,
              },
            }));
          }}
          onItemsPerPageChange={(itemsPerPage) => {
            setParams((prev) => ({
              ...prev,
              pagination: {
                ...prev.pagination,
                pageSize: itemsPerPage,
              },
            }));
          }}
        />
        <ConfirmDialog
          title={t("admin-portal.customer-part-number.delete.title")}
          description={t(
            "admin-portal.customer-part-number.delete.description",
          )}
          open={openDeleteDialog}
          onOpenChange={() => setOpenDeleteDialog(false)}
          onCancel={() => setOpenDeleteDialog(false)}
          onOK={handleDelete}
          okText={t("admin-portal.customer-part-number.delete.confirm")}
        />
        <CustomerPartNumberImportValidationDialog
          open={!!importErrorData}
          onClose={() => {
            setImportErrorData(null);
          }}
          data={importErrorData}
        />
      </Card>
    </Page>
  );
}
