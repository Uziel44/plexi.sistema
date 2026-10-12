import { useState } from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { GenericTable } from "@/components/ui/Table/data-table";
import { EditAnimalDrawer } from "./components/EditAnimalDrawer";
import { Dialog } from "@/components/ui/Dialog";

import { useUpdateAnimal } from "@/utils/hooks/api/animals/usePatchAnimal";
import { useDeleteAnimal } from "@/utils/hooks/api/animals/useDeleteAnimal";

import { ActionButton } from "./types";
import type {
  Animal,
  UpdateAnimalPayload,
} from "@/utils/hooks/api/animals/types";

export const AnimalsBody = ({ data }: { data: Animal[] }) => {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<Animal | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Update animal mutation
  const updateAnimalMutation = useUpdateAnimal({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal updated successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error updating animal:", error);
      toast.error("Failed to update animal. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleUpdateAnimal = async (data: Animal) => {
    const payload: UpdateAnimalPayload = {
      id: data._id,
      tag: data.tag,
      species: data.species,
      birth_date: data.birth_date,
      weight: data.weight,
      health_status: data.health_status,
      farmer_id: data.farmer_id as string,
    };

    await updateAnimalMutation.mutateAsync(payload);
    setEditDrawerOpen(false);
  };

  // Delete animal mutation

  const deleteAnimalMutation = useDeleteAnimal({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal deleted successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error deleting animal:", error);
      toast.error("Failed to delete animal. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const handleDeleteAnimal = async (animalId: string) => {
    await deleteAnimalMutation.mutateAsync(animalId);
  };

  // --- Dialog Logic ---
  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleDialogConfirm = async () => {
    if (selectedField?._id) {
      await handleDeleteAnimal(selectedField._id);
    }
    handleDialogClose();
  };

  const columns: ColumnDef<Animal>[] = [
    {
      accessorKey: "tag",
      header: "Name",
      size: 150,
    },
    {
      accessorKey: "species",
      header: "Species",
      size: 150,
    },
    {
      accessorKey: "birth_date",
      header: "Birth Date",
      size: 150,
      cell: ({ row }) => {
        return dayjs(row.original.birth_date).format("YYYY-MM-DD");
      },
    },
    {
      accessorKey: "weight",
      header: "Weight (kg)",
      size: 150,
    },
    {
      accessorKey: "health_status",
      header: "Health Status",
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

  const handleMoreMenu = (row: Animal, action: ActionButton) => {
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
        title="Animals"
        data={data}
        columns={columns}
        actionButtons={actionButtons}
        onActionClick={handleMoreMenu}
        showPagination
        showSearch
      />

      {selectedField && (
        <EditAnimalDrawer
          animal={selectedField}
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          onUpdate={handleUpdateAnimal}
        />
      )}
      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description={`Are you sure you want to delete ${
          selectedField?.tag ?? "this animal"
        }? This action cannot be undone.`}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogClose}
      />
    </>
  );
};
