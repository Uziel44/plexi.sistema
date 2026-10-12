import { Row, Table, ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TableProps } from "./types";

// checkbox value
function getCheckboxValue<T>(rowOrTable: Row<T> | Table<T>) {
  if ("getIsAllRowsSelected" in rowOrTable) {
    return rowOrTable.getIsAllRowsSelected()
      ? true
      : rowOrTable.getIsSomeRowsSelected()
      ? "indeterminate"
      : false;
  }

  return rowOrTable.getIsSelected()
    ? true
    : rowOrTable.getIsSomeSelected()
    ? "indeterminate"
    : false;
}

// dropdown renderer
function renderDropdownMenu<T>(
  row: Row<T>,
  actionButtons: { id: string; label: string }[],
  onActionClick?: (row: T, action: { id: string; label: string }) => void
) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {actionButtons.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onActionClick?.(row.original, action)}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function buildEnhancedColumns<T>({
  columns,
  checkable,
  actionButtons,
  onActionClick,
  isMultipleSelect,
}: TableProps<T>) {
  let cols = columns;

  if (checkable) {
    const selectColumn: ColumnDef<T> = {
      id: "select",
      header: ({ table }) =>
        isMultipleSelect ? (
          <Checkbox
            id="select-all"
            label=""
            checked={getCheckboxValue(table)}
            onCheckedChange={() => {
              table.toggleAllRowsSelected();
            }}
          />
        ) : null,
      cell: ({ row, table }) => (
        <Checkbox
          id={`row-${row.id}`}
          label=""
          checked={getCheckboxValue(row)}
          disabled={!row.getCanSelect()}
          onCheckedChange={() =>
            isMultipleSelect
              ? row.toggleSelected()
              : table.setRowSelection({ [row.id]: !row.getIsSelected() })
          }
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 2,
    };
    cols = [selectColumn, ...cols];
  }

  if (actionButtons && actionButtons.length) {
    const actionsColumn: ColumnDef<T> = {
      id: "actions",
      cell: ({ row }) => {
        if (actionButtons.length === 1) {
          const action = actionButtons[0];
          return (
            <Button
              onClick={() => onActionClick?.(row.original, action)}
              variant="outline"
              size="sm"
            >
              {action.label}
            </Button>
          );
        }
        return renderDropdownMenu(row, actionButtons, onActionClick);
      },
      enableSorting: false,
      enableHiding: false,
      size: 15,
      meta: { align: "right", style: { width: "80px" } },
    };

    cols = [...cols, actionsColumn];
  }

  return cols;
}
