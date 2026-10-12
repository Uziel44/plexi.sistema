import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import { GenericTable } from "@/components/ui/Table/data-table";
import { EditCropDrawer } from "./components/EditCropDrawer";
import { Dialog } from "@/components/ui/Dialog";

import { useUpdateCrop } from "@/utils/hooks/api/crops/usePatchCrop";
import { useDeleteCrop } from "@/utils/hooks/api/crops/useDeleteCrop";

import { ActionButton } from "./types";
import type { Crop, UpdateCropPayload } from "@/utils/hooks/api/crops/types";

export const CropsBody = ({ data }: { data: Crop[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<Crop | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update crop mutation
  const updateCropMutation = useUpdateCrop({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating crop:", error);
      toast.error("Failed to update crop. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateCrop = async (data: Crop) => {
    const payload: UpdateCropPayload = {
      id: data._id,
      name: data.name,
      type: data.type,
      planting_date: dayjs(data.planting_date).toDate(),
      harvest_date: dayjs(data.harvest_date).toDate(),
      field_id: data.field_id as string,
    };

    await updateCropMutation.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete crop mutation

  const deleteCropMutation = useDeleteCrop({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting crop:", error);
      toast.error("Failed to delete crop. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteCrop = async (cropId: string) => {
    await deleteCropMutation.mutateAsync(cropId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedField?._id) {
      await handleDeleteCrop(selectedField._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Crop>[] = [
    {
      accessorKey: "name",
      header: "Crop Name",
      size: 200,
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 150,
    },
    {
      accessorKey: "planting_date",
      header: "Planting Date",
      size: 150,
      accessorFn: (row) =>
        row.planting_date
          ? dayjs(row.planting_date).format("YYYY-MM-DD: HH:mm")
          : "—",
    },
    {
      accessorKey: "harvest_date",
      header: "Harvest Date",
      size: 150,
      accessorFn: (row) =>
        row.harvest_date
          ? dayjs(row.harvest_date).format("YYYY-MM-DD: HH:mm")
          : "—",
    },
    {
      accessorKey: "field_name",
      header: "Field Name",
      size: 150,
      accessorFn: (row) =>
        typeof row.field_id === "object" && row.field_id?.name
          ? row.field_id.name
          : "—",
    },
  ];

  const actionButtons = [
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];

  const handleMoreMenu = (row: Crop, action: ActionButton) => {
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
        title="Crops"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedField && (
        <EditCropDrawer
          crop={selectedField}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onUpdate={handleUpdateCrop}
        />
      )}
      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description={`Are you sure you want to delete ${
          selectedField?.name ?? "this crop"
        }? This action cannot be undone.`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogClose}
      />
    </>
  );
};
