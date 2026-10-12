"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/utils/constants";

import { buildEnhancedColumns } from "./ColumnBuild";
import type { TableProps } from "./types";

export function GenericTable<T>({
  data,
  columns,
  title = "",
  showPagination = true,
  showSearch = true,
  checkable = false,
  actionButtons,
  onActionClick,
  isMultipleSelect = false,
  disabled = false,
  rowSelection,
  setRowSelection,
  defaultSort,
}: TableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(
    defaultSort ? [defaultSort] : []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const enhancedColumns = React.useMemo(
    () =>
      buildEnhancedColumns({
        data,
        columns,
        checkable,
        actionButtons,
        onActionClick,
        isMultipleSelect,
      }),
    [columns, checkable, data, actionButtons, onActionClick, isMultipleSelect]
  );

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      sorting,
      globalFilter,
      ...(showPagination && { pagination }),
      rowSelection: rowSelection || {},
    },
    enableColumnResizing: true,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: checkable,
  });

  const shouldShowPagination =
    showPagination && data.length > DEFAULT_PAGE_SIZE;

  return (
    <Card className="p-6 w-full border border-gray-300 dark:border-gray-600 shadow-sm">
      {(title || showSearch) && (
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          {title && (
            <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
              {title}
            </h2>
          )}
          {showSearch && (
            <Input
              placeholder="Search"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-xs"
            />
          )}
        </div>
      )}

      <Table className={cn(disabled && "pointer-events-none opacity-50")}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-muted/50 hover:bg-muted/50"
            >
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    key={header.id}
                    style={header.getSize() ? { width: header.getSize() } : {}}
                    className={cn("text-foreground font-semibold")}
                  >
                    {canSort ? (
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sorted === "asc" && <ArrowUp className="h-4 w-4" />}
                        {sorted === "desc" && <ArrowDown className="h-4 w-4" />}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 data-[state=selected]:bg-muted transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={
                    cell.column.getSize()
                      ? { width: cell.column.getSize() }
                      : {}
                  }
                  className={cn("text-foreground")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {shouldShowPagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
            <Select
              value={pagination.pageSize.toString()}
              onChange={(value) =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(value),
                  pageIndex: 0,
                }))
              }
              options={TABLE_PAGE_OPTIONS.map((size) => ({
                value: size.toString(),
                label: `${size} / page`,
              }))}
              className="w-28"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
