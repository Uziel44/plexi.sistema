import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { GenericTable } from "@/components/ui/Table/data-table";
import { EditFieldDrawer } from "./components/EditFieldDrawer";
import { Dialog } from "@/components/ui/Dialog";

import { useUpdateField } from "@/utils/hooks/api/fields/usePatchField";
import { useDeleteField } from "@/utils/hooks/api/fields/useDeleteField";

import { ActionButton } from "./types";
import type { Field, UpdateFieldPayload } from "@/utils/hooks/api/fields/types";

export const FieldsBody = ({ data }: { data: Field[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update field mutation
  const updateFieldMutation = useUpdateField({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      toast.success("Field updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating field:", error);
      toast.error("Failed to update field. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateField = async (data: Field) => {
    const payload: UpdateFieldPayload = {
      id: data._id,
      name: data.name,
      area: data.area,
      location: data.location,
      soil_type: data.soil_type,
      farmer_id: data.farmer_id as string,
    };

    await updateFieldMutation.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete field mutation

  const deleteFieldMutation = useDeleteField({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      toast.success("Field deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteField = async (fieldId: string) => {
    await deleteFieldMutation.mutateAsync(fieldId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedField?._id) {
      await handleDeleteField(selectedField._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Field>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 150,
    },
    {
      accessorKey: "area",
      header: "Area (ha)",
      size: 150,
    },
    {
      accessorKey: "location",
      header: "Location",
      size: 150,
    },
    {
      accessorKey: "soil_type",
      header: "Soil Type",
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
  ];

  const actionButtons = [
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];

  const handleMoreMenu = (row: Field, action: ActionButton) => {
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
        title="Fields"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedField && (
        <EditFieldDrawer
          field={selectedField}
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
