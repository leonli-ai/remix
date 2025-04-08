import type {
  CompanyLocationItem,
  CompanyLocationParams,
} from "~/types/ship-to-location";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserDetailsResponse, EditUserRequest } from "~/types/users";

import { DataTable } from "../common/DataTable";
import CompanyLocationCard from "../ship-to-location/CompanyLocationCard";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { useShipToLocationList } from "~/hooks/use-ship-to-location";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEditUser, useRoles } from "~/hooks/use-users";
import { Button } from "../ui/button";
import { useLoading } from "~/hooks/use-global-loading";
import { useShopifyInformation } from "~/lib/shopify";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import type { UserFormData } from "~/lib/schema/users.schema";
import { useNavigate } from "@remix-run/react";
import { CustomPaginationNew } from "../common/CustomPaginationNew";
import { QUERY_USER_DETAILS } from "~/constant/react-query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { FormMessage } from "../ui/form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {useAddLocalePath} from '~/hooks/utils.hooks';

interface CompanyLocationListProps {
  locationList: CompanyLocationItem[];
  isEdit: boolean;
  isCreate?: boolean;
  customerId: string;
  companyContactId: string;
  getValues?: UseFormGetValues<UserFormData>;
  setValue?: UseFormSetValue<UserFormData>;
  userDetails?: UserDetailsResponse;
}

export const CompanyLocationList = ({
  isEdit,
  isCreate = false,
  locationList,
  customerId,
  companyContactId,
  getValues,
  setValue,
  userDetails,
}: CompanyLocationListProps) => {
  const { t } = useTranslation();
  const { storeName, shopifyCustomerId, shopifyCompanyId } =
    useShopifyInformation();
  const [configData, setConfigData] = useState<CompanyLocationParams>({
    customerId: shopifyCustomerId,
    companyId: shopifyCompanyId,
    storeName,
    pagination: {
      currentPage: 1,
      perPage: 10,
      first: 10,
      query: "",
    },
  });
  const queryClient = useQueryClient();
  const [rowRoles, setRowRoles] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const {addLocalePath} = useAddLocalePath()
  const { data: rolesData } = useRoles({
    customerId: shopifyCustomerId,
    storeName,
  });

  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const { data, isLoading, isRefetching } = useShipToLocationList(
    configData,
    isEdit || isCreate,
  );

  const { mutate: editUser } = useEditUser();

  useEffect(() => {
    if (isEdit) {
      setSelectedRows(locationList.map((location) => location.id));
      setRowRoles(
        locationList.reduce(
          (acc, location) => {
            acc[location.id] = location.roleId ?? "";
            return acc;
          },
          {} as { [key: string]: string },
        ),
      );
    }
  }, [isEdit, locationList]);

  const columns: ColumnDef<CompanyLocationItem>[] = useMemo(
    () => [
      ...(isEdit || isCreate
        ? [
            {
              id: "select",
              header: ({ table }: { table: any }) => (
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label={t("user.add.company-locations.select-all")}
                  className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white  [&>span>svg]:stroke-[4]"
                />
              ),
              cell: ({ row }: { row: any }) => (
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label={t("user.add.company-locations.select-row")}
                  className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
          ]
        : []),
      {
        accessorKey: "name",
        header: t("user.add.company-locations.name"),
      },
      {
        accessorKey: "shippingAddress",
        header: t("user.add.company-locations.company-address"),
        cell: ({ row }) => {
          const { address1, address2 } = row.getValue(
            "shippingAddress",
          ) as CompanyLocationItem["shippingAddress"];
          return (
            <div className="">{`${address1 ? address1 : ""} ${address2 ? address2 : ""}`}</div>
          );
        },
      },
      {
        accessorKey: "shippingAddress.city",
        header: t("user.add.company-locations.city"),
      },
      {
        accessorKey: "shippingAddress.province",
        header: t("user.add.company-locations.state"),
      },
      {
        accessorKey: "shippingAddress.zip",
        header: t("user.add.company-locations.zip"),
      },
      {
        accessorKey: "shippingAddress.country",
        header: t("user.add.company-locations.country"),
      },
      {
        accessorKey: "role",
        header: t("user.add.company-locations.role"),
        cell: ({ row }: { row: any }) => {
          const role = rowRoles[row.original.id] || row.original.roleId;
          return isEdit || isCreate ? (
            <Select
              value={role}
              onValueChange={(newRoleId) => {
                setRowRoles((prev) => ({
                  ...prev,
                  [row.original.id]: newRoleId,
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("user.add.company-locations.select-role")}
                />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {t("company-location.list.table."+role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            row.original.role
          );
        },
      },
    ],
    [isEdit, isCreate, rowRoles, rolesData?.roles],
  );

  useEffect(() => {
    if (isCreate) {
      if (selectedRows.length > 0) {
        const formattedLocations = selectedRows.map((location) => ({
          locationId: location ?? "",
          roleId: "",
        }));
        setValue?.("companyLocations", formattedLocations as any);
        if (Object.keys(rowRoles).length > 0) {
          const formLocations = getValues?.("companyLocations") || [];
          const updatedLocations = formLocations.map((location) => {
            const roleId = rowRoles[location.locationId];
            if (roleId) {
              return { ...location, roleId };
            }
            return location;
          });
          setValue?.("companyLocations", updatedLocations as any);
        }
      } else {
        setValue?.("companyLocations", [] as any);
      }
    }
  }, [getValues, isCreate, rowRoles, selectedRows, setValue]);

  const handleSave = () => {
    // Get location role assignments from selected rows
    const locationRoleAssignments = Object.entries(rowRoles)
      .filter(([key]) => selectedRows.includes(key))
      .map(([companyLocationId, roleId]) => ({ companyLocationId, roleId }));

    // Validation: At least one location must be selected
    if (selectedRows.length === 0) {
      setErrorMessage(t("user.add.company-locations.select-at-least-one"));
      return;
    }

    // Validation: Each selected location must have a role assigned
    const allInRowRoles = selectedRows.every((key) => key in rowRoles);
    if (!allInRowRoles) {
      setErrorMessage(t("user.add.company-locations.select-role-for-selected"));
      return;
    }

    setErrorMessage(null);

    // Find company admin role (role with Admin name and null companyLocation)
    const companyAdminRole = userDetails?.roles.find((role) => {
      const isAdmin = role.name === "Admin";
      const hasNoLocation = role.companyLocation === null;
      return isAdmin && hasNoLocation;
    });

    // Combine location role assignments with company admin role
    // If user has company admin role, add it to assignments with company ID
    const roleAssignments = [
      ...locationRoleAssignments,
      ...(companyAdminRole && userDetails?.company
        ? [
            {
              companyId: userDetails.company.id,
              roleId: companyAdminRole.id,
            },
          ]
        : []),
    ];

    // Prepare request parameters
    const inputParams: EditUserRequest = {
      storeName: storeName || "",
      customerId: customerId || "",
      data: {
        companyId: shopifyCompanyId || "",
        companyContactId: companyContactId,
        roleAssignments,
      },
    };

    // Send update request
    setLoading(true);
    editUser(inputParams, {
      onSuccess: () => {
        setLoading(false);
        queryClient.invalidateQueries({ queryKey: [QUERY_USER_DETAILS] });
        toast.success(t("user.add.company-locations.success"));
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message);
      },
    });
  };

  const handleCancel = () => {
    navigate(addLocalePath("/apps/customer-account/company-management/customer"));
  };

  const mobileRenderCompanyLocations = useMemo(() => {
    return isCreate || isEdit ? (data?.companyLocations ?? []) : locationList;
  }, [data?.companyLocations, isCreate, isEdit, locationList]);

  return (
    <div className="md:mt-20 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold">
          {t("user.add.company-locations.title")}
        </h2>
      </div>

      <div className="app-hidden lg:block">
        <DataTable
          isLoading={isLoading || isRefetching}
          columns={columns}
          data={
            isCreate || isEdit ? (data?.companyLocations ?? []) : locationList
          }
          rowClassNameFn={(_row, index) =>
            index % 2 !== 0 ? "bg-blue-50" : ""
          }
          headerClassName="bg-blue-50"
          headerCellClassName="font-bold text-black"
          emptyMessage={t("user.add.company-locations.empty")}
          selectedRows={selectedRows}
          onRowSelectionChange={(selection) => {
            setSelectedRows(Array.from(selection));
          }}
          setRowId={(row) => row.id}
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4">
        {(isEdit || isCreate) && (
          <Checkbox
            className="ml-4"
            checked={mobileRenderCompanyLocations.every((location) =>
              selectedRows.includes(location.id),
            )}
            onCheckedChange={(value: boolean) => {
              setSelectedRows((pre) => {
                if (value) {
                  return [
                    ...pre,
                    ...mobileRenderCompanyLocations.map(
                      (location) => location.id,
                    ),
                  ];
                } else {
                  return pre.filter(
                    (id) =>
                      !mobileRenderCompanyLocations.some(
                        (location) => location.id === id,
                      ),
                  );
                }
              });
            }}
          />
        )}
        {mobileRenderCompanyLocations?.map((location) => {
          const role = rowRoles[location.id] || location.roleId;
          return (
            <CompanyLocationCard
              key={location.id}
              companyLocationItem={location}
              isEdit={isEdit}
              isSelected={selectedRows.includes(location.id)}
              onCheckedChange={(value, locationId) => {
                setSelectedRows((prev) => {
                  const newSelectedRows = new Set(prev);
                  if (value) {
                    newSelectedRows.add(locationId);
                  } else {
                    newSelectedRows.delete(locationId);
                  }
                  return Array.from(newSelectedRows);
                });
              }}
              onRoleChange={(newRoleId) => {
                setRowRoles((prev) => ({
                  ...prev,
                  [location.id]: newRoleId,
                }));
              }}
              currentRole={role}
              roles={(rolesData?.roles as any) ?? []}
              isCreate={isCreate}
            />
          );
        })}
      </div>
      {isEdit && errorMessage && (
        <div className="text-red-500 text-[0.8rem] font-medium text-destructive my-4">
          {errorMessage}
        </div>
      )}
      {isCreate && <FormMessage className="text-[0.8rem] font-medium my-4" />}

      {(isEdit || isCreate) && (
        <CustomPaginationNew
          currentPage={configData.pagination.currentPage ?? 1}
          totalPages={
            data?.pagination?.totalCount
              ? Math.ceil(
                  data?.pagination?.totalCount /
                    (configData.pagination.perPage ?? 10),
                )
              : 0
          }
          itemsPerPage={configData.pagination.perPage ?? 10}
          hasPreviousButton={data?.pagination?.hasPreviousPage}
          hasNextButton={data?.pagination?.hasNextPage}
          onPreviousPageChange={() => {
            setConfigData((prev: CompanyLocationParams) => ({
              ...prev,
              pagination: {
                currentPage: (prev.pagination.currentPage ?? 1) - 1,
                perPage: prev.pagination.perPage ?? 10,
                last: prev.pagination.perPage ?? 10,
                before: data?.pagination?.startCursor,
                query: prev.pagination.query,
                first: undefined,
                after: undefined,
              },
            }));
          }}
          onNextPageChange={() => {
            setConfigData((prev: CompanyLocationParams) => ({
              ...prev,
              pagination: {
                currentPage: (prev.pagination.currentPage ?? 1) + 1,
                perPage: prev.pagination.perPage ?? 10,
                first: prev.pagination.perPage ?? 10,
                after: data?.pagination?.endCursor,
                query: prev.pagination.query,
                last: undefined,
                before: undefined,
              },
            }));
          }}
          onItemsPerPageChange={(value) => {
            setConfigData((prev: CompanyLocationParams) => {
              return {
                ...prev,
                pagination: {
                  currentPage: 1,
                  perPage: value,
                  first: value,
                  query: prev.pagination.query,
                  after: undefined,
                  before: undefined,
                  last: undefined,
                },
              };
            });
          }}
        />
      )}

      {isEdit && (
        <div className="flex justify-center gap-6 mt-12">
          <Button className="w-[240px]" onClick={handleSave}>
            {t("user.add.company-locations.save")}
          </Button>
          <Button
            className="w-[240px]"
            variant="outline"
            onClick={handleCancel}
          >
            {t("user.add.company-locations.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
};
