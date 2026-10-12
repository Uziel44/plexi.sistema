import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

export type ActionButton = {
  id: string;
  label: string;
};
export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  showPagination?: boolean;
  showSearch?: boolean;
  checkable?: boolean;
  actionButtons?: ActionButton[];
  onActionClick?: (row: T, action: ActionButton) => void;
  isMultipleSelect?: boolean;
  disabled?: boolean;
  rowSelection?: RowSelectionState;
  setRowSelection?: Dispatch<SetStateAction<RowSelectionState>>;
  defaultSort?: { id: string; desc: boolean };
}
