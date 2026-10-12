import { useState } from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { GenericTable } from "@/components/ui/Table/data-table";
import { EditEquipmentDrawer } from "./components/EditEquipmentDrawer";
import { Dialog } from "@/components/ui/Dialog";

import { useUpdateEquipment } from "@/utils/hooks/api/equipment/usePatchEquipment";
import { useDeleteEquipment } from "@/utils/hooks/api/equipment/useDeleteEquipment";

import { ActionButton } from "./types";
import type {
  Equipment,
  UpdateEquipmentPayload,
} from "@/utils/hooks/api/equipment/types";

export const EquipmentBody = ({ data }: { data: Equipment[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<Equipment | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update mutation
  const updateEquipmentMutation = useUpdateEquipment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipment updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateField = async (data: Equipment) => {
    const payload: UpdateEquipmentPayload = {
      id: data._id,
      name: data.name,
      type: data.type,
      status: data.status,
      purchase_date: data.purchase_date,
      last_service_date: data.last_service_date,
      farmer_id: data.farmer_id as string,
    };

    await updateEquipmentMutation.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete mutation

  const deleteEquipmentMutation = useDeleteEquipment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipment deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteEquipment = async (equipmentId: string) => {
    await deleteEquipmentMutation.mutateAsync(equipmentId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedField?._id) {
      await handleDeleteEquipment(selectedField._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Equipment>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 150,
    },
    { accessorKey: "type", header: "Type", size: 150 },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
    },
    {
      accessorKey: "purchase_date",
      header: "Purchase Date",
      size: 150,
      accessorFn: (row) =>
        row.purchase_date ? dayjs(row.purchase_date).format("YYYY-MM-DD") : "—",
    },
    {
      accessorKey: "last_service_date",
      header: "Last Service Date",
      size: 150,
      accessorFn: (row) =>
        row.last_service_date
          ? dayjs(row.last_service_date).format("YYYY-MM-DD")
          : "—",
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
  ];

  const actionButtons = [
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];

  const handleMoreMenu = (row: Equipment, action: ActionButton) => {
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
        title="Equipment"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedField && (
        <EditEquipmentDrawer
          equipment={selectedField}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onUpdate={handleUpdateField}
        />
      )}
      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description={`Are you sure you want to delete ${
          selectedField?.name ?? "this field"
        }? This action cannot be undone.`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogClose}
      />
    </>
  );
};
