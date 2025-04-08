import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { forwardRef, useImperativeHandle } from "react";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  selectedRows?: (string | number)[];
  onRowSelectionChange?: (selection: Set<string | number>) => void;
  setRowId?: (row: TData) => string;
  emptyMessage?: string;
  headerClassName?: string;
  headerCellClassName?: string;
  rowClassName?: string;
  rowClassNameFn?: (row: TData, index: number) => string;
  tableRowOnClick?: (row: TData) => void;
  rowCellClassName?: string;
  bodyClassName?: string;
}

export interface DataTableRef {
  table: ReturnType<typeof useReactTable>;
}

export const DataTable = forwardRef<DataTableRef, DataTableProps<any, any>>(
  (
    {
      columns,
      data,
      isLoading,
      onRowSelectionChange,
      setRowId,
      selectedRows,
      emptyMessage = "No results.",
      headerClassName,
      headerCellClassName,
      rowClassName,
      rowClassNameFn,
      rowCellClassName,
      tableRowOnClick,
      bodyClassName,
    },
    ref,
  ) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [rowSelection, setRowSelection] = React.useState<
      Record<string | number, boolean>
    >({});

    useEffect(() => {
      if (selectedRows) {
        const initialSelection: Record<string | number, boolean> = {};
        selectedRows.forEach((id) => {
          initialSelection[id] = true;
        });
        // Only update if the selection has changed
        if (JSON.stringify(initialSelection) !== JSON.stringify(rowSelection)) {
          setRowSelection(initialSelection);
        }
      }
    }, [selectedRows]);

    useEffect(() => {
      if (onRowSelectionChange) {
        onRowSelectionChange(
          new Set(Object.keys(rowSelection).filter((key) => rowSelection[key])),
        );
      }
    }, [rowSelection]);

    const table = useReactTable({
      data,
      columns,
      getRowId: setRowId,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        rowSelection,
      },
    });

    useImperativeHandle(ref, () => ({
      table,
    }));

    return (
      <div className="space-y-4">
        <div className="rounded-md border border-secondary-light">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className={cn("border-secondary-light", headerClassName)}
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(headerCellClassName)}
                      style={{
                        width: header.column.columnDef.size
                          ? `${header.column.columnDef.size}px`
                          : undefined,
                        maxWidth: header.column.columnDef.maxSize
                          ? `${header.column.columnDef.maxSize}px`
                          : undefined,
                        minWidth: header.column.columnDef.minSize
                          ? `${header.column.columnDef.minSize}px`
                          : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={cn(bodyClassName)}>
              {isLoading ? (
                <TableRow className="border-secondary-light">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-secondary-light",
                      rowClassName,
                      rowClassNameFn?.(row.original, row.index),
                    )}
                    onClick={() => tableRowOnClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.columnDef.size
                            ? `${cell.column.columnDef.size}px`
                            : undefined,
                          maxWidth: cell.column.columnDef.maxSize
                            ? `${cell.column.columnDef.maxSize}px`
                            : undefined,
                          minWidth: cell.column.columnDef.minSize
                            ? `${cell.column.columnDef.minSize}px`
                            : undefined,
                        }}
                        className={cn("break-words", rowCellClassName)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
);
