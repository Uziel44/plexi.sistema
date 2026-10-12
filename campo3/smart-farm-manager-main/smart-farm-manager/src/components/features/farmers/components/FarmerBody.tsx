import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import { GenericTable } from "@/components/ui/Table/data-table";
import { EditFarmerDrawer } from "./components/EditFarmerDrawer";
import { Dialog } from "@/components/ui/Dialog";
import { useUpdateFarmer } from "@/utils/hooks/api/farmers/usePatchFarmer";
import { useDeleteFarmer } from "@/utils/hooks/api/farmers/useDeleteFarmer";
import { ActionButton } from "./types";
import type {
  Farmer,
  UpdateFarmerPayload,
} from "@/utils/hooks/api/farmers/types";

export const FarmerBody = ({ data }: { data: Farmer[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update farmer mutation
  const updateFarmerMutation = useUpdateFarmer({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      toast.success("Farmer updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating farmer:", error);
      toast.error("Failed to update farmer. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateFarmer = async (data: Farmer) => {
    const payload: UpdateFarmerPayload = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    };
    if (data.password) payload.password = data.password;

    await updateFarmerMutation.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete farmer mutation

  const deleteFarmerMutation = useDeleteFarmer({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      toast.success("Farmer deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting farmer:", error);
      toast.error("Failed to delete farmer. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteFarmer = async (farmerId: string) => {
    await deleteFarmerMutation.mutateAsync(farmerId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedFarmer(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedFarmer?._id) {
      await handleDeleteFarmer(selectedFarmer._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Farmer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 200,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 150,
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 200,
    },
  ];

  const actionButtons = [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete" },
  ];

  const handleMoreMenu = (row: Farmer, action: ActionButton) => {
    const { label } = action;
    switch (label.toLowerCase()) {
      case "view":
        console.log("Viewing farmer:", row);
        break;
      case "edit":
        setSelectedFarmer(row);
        setEditDrawerOpen(true);
        break;
      case "delete":
        setSelectedFarmer(row);
        setOpenDialog(true);
        break;
      default:
        return null;
    }
  };

  return (
    <>
      <GenericTable
        title="Users"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedFarmer && (
        <EditFarmerDrawer
          farmer={selectedFarmer}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onUpdate={handleUpdateFarmer}
        />
      )}
      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description={`Are you sure you want to delete ${
          selectedFarmer?.name ?? "this farmer"
        }? This action cannot be undone.`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogClose}
      />
    </>
  );
};
