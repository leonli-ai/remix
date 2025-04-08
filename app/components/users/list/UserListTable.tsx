import { useNavigate, useSearchParams } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, Row } from "@tanstack/react-table";
import _ from "lodash";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Trash,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DynamicFilterBuilderHeader } from "~/components/common/DynamicFilterBuilderHeader";
import {
  DesktopDynamicFilterV2,
  MobileDynamicFilterV2,
} from "~/components/common/DynamicFilterV2";
import { Button } from "~/components/ui/button";
import { UserFilterType, userFilterConfig } from "~/config/filterConfig";
import { QUERY_USER_LIST } from "~/constant/react-query-keys";
import { useLoading } from "~/hooks/use-global-loading";
import { useDeleteUser, useUserList } from "~/hooks/use-users";
import { isEmptyFilterInput } from "~/lib/filter";
import { useShopifyInformation } from "~/lib/shopify";
import { DynamicFilterValueTypes, FilterTag } from "~/types/filter";
import type {
  DeleteUserParams,
  UserItemInfo,
  UserListParams,
} from "~/types/users";

import { ConfirmDialog } from "../../common/ConfirmDialog";
import { DataTable } from "../../common/DataTable";
import { TableActionGroup } from "../../common/TableActionGroup";
import UserCard from "./UserCard";
import { useTranslation } from "react-i18next";
import { useAddLocalePath } from "~/hooks/utils.hooks";
function parseQueryString(queryString: string): Record<string, string> {
  const [key, value] = queryString.split(":");
  return { [key]: value };
}

export default function UserListTable() {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId, shopifyCompanyId } =
    useShopifyInformation();
  const navigate = useNavigate();
  const { addLocalePath } = useAddLocalePath();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [deleteParams, setDeleteParams] = useState<DeleteUserParams[]>([]);
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();

  const afterCursor = searchParams.get("after") || undefined;
  const searchQuery = searchParams.get("q") || "";

  const [params, setParams] = useState<UserListParams>({
    customerId: shopifyCustomerId,
    companyId: shopifyCompanyId,
    storeName: storeName,
    pagination: {
      first: 10,
      query: searchQuery,
      after: afterCursor,
    },
  });

  const { data, isLoading, isRefetching } = useUserList(params);
  const { mutate: deleteUser } = useDeleteUser();

  const handleDelete = () => {
    setLoading(true);
    deleteUser(deleteParams[0], {
      onSuccess: () => {
        setLoading(false);
        setOpenDeleteDialog(false);
        setDeleteParams([]);
        queryClient.invalidateQueries({ queryKey: [QUERY_USER_LIST] });

        toast.success(t("user.list.table.delete-success"));
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message);
      },
    });
  };

  const navigateToUserDetails = (userInfo: UserItemInfo, isEdit?: boolean) => {
    const encodedId = encodeURIComponent(userInfo.id);
    const encodedCustomerId = encodeURIComponent(userInfo.customer.id);
    const routeName = `${userInfo.customer.firstName} ${userInfo.customer.lastName}`;
    return navigate(
      addLocalePath(
        `/apps/customer-account/company-management/customer/${encodedId}?customerId=${encodedCustomerId}${isEdit ? "&isEdit=true" : ""}&routeName=${encodeURIComponent(routeName)}`,
      ),
    );
  };

  const columns: ColumnDef<UserItemInfo>[] = [
    {
      accessorKey: "customer.firstName",
      header: t("user.list.table.first-name"),
    },
    {
      accessorKey: "customer.lastName",
      header: t("user.list.table.last-name"),
    },
    {
      accessorKey: "customer.email",
      header: t("user.list.table.email"),
    },
    {
      accessorKey: "isMainContact",
      header: t("user.list.table.main-contact"),
      cell: ({ row }: { row: Row<UserItemInfo> }) => (
        <div>
          {row.original.isMainContact
            ? t("user.list.table.yes")
            : t("user.list.table.no")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: Row<UserItemInfo> }) => {
        const actionGroup = [
          {
            icon: <Eye />,
            label: t("user.list.table.view"),
            onClick: (row: Row<any>) => navigateToUserDetails(row.original),
          },
          {
            icon: <Edit />,
            label: t("user.list.table.edit"),
            onClick: (row: Row<any>) =>
              navigateToUserDetails(row.original, true),
          },
          {
            icon: <Trash />,
            label: t("user.list.table.delete"),
            onClick: (row: Row<any>) => {
              setOpenDeleteDialog(true);
              setDeleteParams([
                {
                  storeName: storeName,
                  customerId: row.original.customer.id,
                  data: {
                    companyContactId: row.original.id,
                    companyId: shopifyCompanyId,
                  },
                },
              ]);
            },
          },
        ];
        return <TableActionGroup actionGroup={actionGroup} row={row} />;
      },
    },
  ];

  const [filterValue, setFilterValue] = useState<
    Record<UserFilterType, DynamicFilterValueTypes>
  >({
    email: "",
  });

  const handleNextPage = () => {
    if (data?.pagination?.hasNextPage && data?.pagination?.endCursor) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("after", data.pagination.endCursor);
        newParams.delete("before");
        return newParams;
      });
    }
  };

  const handlePreviousPage = () => {
    if (data?.pagination?.hasPreviousPage && data?.pagination?.startCursor) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("after");
        newParams.set("before", data.pagination.startCursor);
        return newParams;
      });
    }
  };

  useEffect(() => {
    const beforeCursor = searchParams.get("before") || undefined;

    const paramsValue = searchParams.get("q");
    const queryObject = paramsValue ? parseQueryString(paramsValue) : {};
    setFilterValue(queryObject);

    setParams((prev) => ({
      ...prev,
      pagination: {
        first: beforeCursor ? undefined : 10,
        last: beforeCursor ? 10 : undefined,
        after: beforeCursor ? undefined : afterCursor,
        before: beforeCursor,
        query: searchQuery,
      },
    }));
  }, [searchQuery, afterCursor, searchParams]);

  const handleApply = (
    filterValue: Record<UserFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("email", filterValue.email as string),
    };
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  const handleClear = (
    filterValue?: Record<UserFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("email", filterValue?.email as string),
    };

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  const handleRemoveFilter = (
    tag: FilterTag<UserFilterType>,
    filterValue: Record<UserFilterType, DynamicFilterValueTypes>,
  ) => {
    const filters = {
      ...isEmptyFilterInput("email", filterValue.email as string),
    };
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete("after");
      newParams.delete("before");
      if (!_.isEmpty(filters)) {
        newParams.set(
          "q",
          `${Object.keys(filters)[0]}:${Object.values(filters)[0]}`,
        );
      } else {
        newParams.delete("q");
      }
      return newParams;
    });
  };

  useEffect(() => {
    if (data && afterCursor && data.companyContacts.length === 0) {
      handlePreviousPage();
    }
  }, [data, afterCursor]);

  const NewUserButton = (
    <Button
      className="hover:bg-main-color/80 bg-main-color"
      onClick={() =>
        navigate(
          addLocalePath(
            "/apps/customer-account/company-management/customer/create",
          ),
        )
      }
    >
      {t("user.list.table.new-user")}
    </Button>
  );

  const filterConfig = userFilterConfig();

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <UsersRound className="h-6 w-6" />
          <h1 className="text-xl font-semibold md:text-2xl">
            {t("user.list.table.title")}
          </h1>
        </div>
        <div className="hidden lg:!block">{NewUserButton}</div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <DynamicFilterBuilderHeader
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            setShowMobileFilter={setShowMobileFilter}
            hideFilterTextWhileMobile={true}
            hideSeparator={true}
          />
          <div className="block lg:hidden">{NewUserButton}</div>
        </div>

        {showFilters && (
          <DesktopDynamicFilterV2
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onSearch={handleApply}
            onClearAllFilters={handleClear}
            onRemoveFilter={handleRemoveFilter}
          />
        )}

        {showMobileFilter && (
          <MobileDynamicFilterV2
            filterConfig={filterConfig}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            isOpen={showMobileFilter}
            onClose={() => setShowMobileFilter(false)}
            onMobileApply={handleApply}
          />
        )}
      </div>

      <div className="app-hidden mt-4 lg:block">
        <DataTable
          isLoading={isLoading || isRefetching}
          columns={columns}
          data={data?.companyContacts ?? []}
          emptyMessage={t("user.list.table.no-users-found")}
          rowClassNameFn={(_row, index) =>
            index % 2 !== 0 ? "bg-blue-50" : ""
          }
          headerClassName="bg-blue-50"
          headerCellClassName="font-bold text-black"
          rowClassName="cursor-pointer"
          tableRowOnClick={(row) => {
            navigateToUserDetails(row);
          }}
        />
      </div>
      {/* Mobile */}
      <div className="space-y-4 lg:hidden">
        {data?.companyContacts.map((userInfo) => (
          <UserCard
            key={userInfo.id}
            userItemInfo={userInfo}
            onView={() => navigateToUserDetails(userInfo)}
            onEdit={() => navigateToUserDetails(userInfo, true)}
            onDelete={() => {
              setOpenDeleteDialog(true);
              setDeleteParams([
                {
                  storeName: storeName,
                  customerId: userInfo.customer.id,
                  data: {
                    companyContactId: userInfo.id,
                    companyId: shopifyCompanyId,
                  },
                },
              ]);
            }}
          />
        ))}
      </div>

      {(data?.pagination?.hasNextPage || data?.pagination?.hasPreviousPage) && (
        <div className="flex items-center justify-end gap-2 p-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousPage}
            disabled={!data?.pagination?.hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={!data?.pagination?.hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        title={t("user.list.table.delete-title")}
        description={t("user.list.table.delete-description")}
        open={openDeleteDialog}
        onOpenChange={() => setOpenDeleteDialog(false)}
        onCancel={() => setOpenDeleteDialog(false)}
        onOK={handleDelete}
        okText={t("user.list.table.delete-confirm")}
      />
    </div>
  );
}
