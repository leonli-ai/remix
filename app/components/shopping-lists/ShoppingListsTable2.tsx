import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTable } from "~/components/common/DataTable";
import { QUERY_ALL_SHOPPING_LISTS } from "~/constant/react-query-keys";
import { useShopifyInformation } from "~/lib/shopify";
import { cn, formatPrice } from "~/lib/utils";
import { ShoppingList } from "~/types/shopping-lists/shopping-lists.schema";
import { ShoppingListActions } from "./ShoppingListActions";

interface ShoppingListsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  shoppingLists: ShoppingList[];
  setDeleteIds: (ids: number[]) => void;
  onDelete: (id: number) => void;
  onSetAsDefault: (id: number) => void;
  isLoading: boolean;
  onEdit: (id: number, name: string) => void;
}

export default function ShoppingListsTable({
  className,
  shoppingLists,
  setDeleteIds,
  onDelete,
  onSetAsDefault,
  isLoading,
  onEdit,
}: ShoppingListsTableProps) {
  const { t } = useTranslation();
  const { cartCurrency } = useShopifyInformation();

  const [selectedRows, setSelectedRows] = useState<ShoppingList["id"][]>([]);

  useEffect(() => {
    setDeleteIds(selectedRows);
  }, [selectedRows]);

  const handleEdit = (id: number, name: string) => {
    onEdit(id, name);
  };

  const handleDelete = (id: number) => {
    onDelete(id);
  };

  const handleSetAsDefault = (id: number) => {
    onSetAsDefault(id);
  };

  const queryClient = useQueryClient();

  const columns: ColumnDef<ShoppingList>[] = [
    {
      accessorKey: "name",
      header: t("shopping-list.list.table.name"),
      cell: ({ row }) => {
        return (
          <div
            onClick={() => handleEdit(row.original.id, row.original.name)}
            className="cursor-pointer text-text-color"
          >
            {row.original.name}
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: "subtotal",
      header: t("shopping-list.list.table.subtotal"),
      cell: ({ row }) => {
        return (
          <p>
            {formatPrice(
              row.original.subtotal?.toString() || "0",
              row.original.currencyCode || cartCurrency,
            )}
          </p>
        );
      },
    },
    {
      accessorKey: "items",
      header: t("shopping-list.list.table.items"),
    },
    {
      accessorKey: "isDefault",
      header: t("shopping-list.list.table.default"),
      cell: ({ row }) => (row.original.isDefault ? "Yes" : "No"),
    },
    {
      accessorKey: "createdAt",
      header: t("shopping-list.list.table.created-at"),
      size: 160,
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "updatedAt",
      size: 160,
      header: t("shopping-list.list.table.updated-at"),
      cell: ({ row }) => format(new Date(row.original.updatedAt), "MM/dd/yyyy"),
    },
    {
      id: "actions",
      maxSize: 60,
      cell: ({ row }) => {
        const list = row.original;
        return (
          <div className="flex justify-end">
            <ShoppingListActions
              shoppingListId={list.id}
              isDefault={Boolean(list?.isDefault)}
              onEdit={() => {}}
              onDelete={() => handleDelete(list.id)}
              onSetAsDefault={() => handleSetAsDefault(list.id)}
              useShoppingListEditDialog={{
                initialValues: {
                  shoppingListName: list.name,
                  shoppingListDescription: list?.description || "",
                  isDefault: Boolean(list?.isDefault),
                },
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: [QUERY_ALL_SHOPPING_LISTS],
                  });
                },
              }}
            ></ShoppingListActions>
          </div>
        );
      },
    },
  ];

  return (
    <div className={cn("mt-4", className)}>
      <DataTable
        columns={columns}
        data={shoppingLists}
        isLoading={isLoading}
        setRowId={(row) => row.id.toString()}
        selectedRows={selectedRows}
        emptyMessage={t("shopping-list.list.no-lists-found")}
        rowClassNameFn={(row, index) =>
          index % 2 !== 0 ? "bg-blue-50 text-primary-text" : "text-primary-text"
        }
        headerClassName="bg-blue-50"
        headerCellClassName="font-bold text-black"
      />
    </div>
  );
}
