import { useState } from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { GenericTable } from "@/components/ui/Table/data-table";
import { EditTransactionDrawer } from "./components/EditTransactionDrawer";
import { Dialog } from "@/components/ui/Dialog";

import { useUpdateTransaction } from "@/utils/hooks/api/transactions/usePatchTransaction";
import { useDeleteTransaction } from "@/utils/hooks/api/transactions/useDeleteTransaction";

import { ActionButton } from "./types";
import type {
  Transaction,
  UpdateTransactionPayload,
} from "@/utils/hooks/api/transactions/types";

export const TransactionsBody = ({ data }: { data: Transaction[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<Transaction | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update mutation
  const updateMut = useUpdateTransaction({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateField = async (data: Transaction) => {
    const payload: UpdateTransactionPayload = {
      id: data._id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      equipment_id: data.equipment_id as string,
      farmer_id: data.farmer_id as string,
      category: data.category,
      description: data.description,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      invoice_number: data.invoice_number,
      vendor_name: data.vendor_name,
    };

    await updateMut.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete mutation

  const deleteMut = useDeleteTransaction({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteMut.mutateAsync(transactionId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedField?._id) {
      await handleDeleteTransaction(selectedField._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "type", header: "Type", size: 150 },
    {
      accessorKey: "category",
      header: "Category",
      size: 100,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      accessorFn: (row) => `$${row.amount.toFixed(2)}`,
    },
    {
      accessorKey: "date",
      header: "Date",
      size: 150,
      accessorFn: (row) =>
        row.date ? dayjs(row.date).format("YYYY-MM-DD") : "—",
    },

    {
      accessorKey: "description",
      header: "Description",
      size: 200,
      accessorFn: (row) => row.description ?? "—",
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      size: 150,
    },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      size: 150,
    },
    {
      accessorKey: "farmer_name",
      header: "Farmer",
      size: 150,
      accessorFn: (row) =>
        typeof row.farmer_id === "object" && row.farmer_id?.name
          ? row.farmer_id.name
          : "—",
    },
    {
      accessorKey: "equipment_name",
      header: "Equipment",
      size: 150,
      accessorFn: (row) =>
        typeof row.equipment_id === "object" && row.equipment_id?.name
          ? row.equipment_id.name
          : "—",
    },
    {
      accessorKey: "invoice_number",
      header: "Invoice Number",
      size: 150,
    },
    {
      accessorKey: "vendor_name",
      header: "Vendor Name",
      size: 150,
    },
  ];

  const actionButtons = [
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];

  const handleMoreMenu = (row: Transaction, action: ActionButton) => {
    const { label } = action;
    switch (label.toLowerCase()) {
      case "edit":
        setSelectedField(row);
        setEditDrawerOpen(true);
        break;
      case "delete":
        setSelectedField(row);
        setOpenDialog(true);
        break;
      default:
        return null;
    }
  };

  return (
    <>
      <GenericTable
        title="Transactions"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedField && (
        <EditTransactionDrawer
          transaction={selectedField}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onUpdate={handleUpdateField}
        />
      )}
      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description={`Are you sure you want to delete this field? This action cannot be undone.`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogClose}
      />
    </>
  );
};
