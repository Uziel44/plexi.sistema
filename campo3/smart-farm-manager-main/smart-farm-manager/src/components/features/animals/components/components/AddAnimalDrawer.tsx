"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";

import { useAddAnimal } from "@/utils/hooks/api/animals/usePostAnimal";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";
import { DateTimePicker } from "@/components/ui/datetime-picker";

const aniamlsSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  species: z.string().min(1, "Species is required"),
  birth_date: z.date({ message: "Birth date is required" }),
  weight: z.number().min(1, "Weight is required"),
  health_status: z.string().min(1, "Health status is required"),
  farmer_id: z.string().min(1, "Farmer ID is required"),
});

type AnimalFormData = z.infer<typeof aniamlsSchema>;

export const AddAnimalDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: farmers } = useFarmers();

  const farmersOptions = useMemo(() => {
    if (!farmers) return [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer._id,
    }));
  }, [farmers]);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(aniamlsSchema),
    defaultValues: {
      tag: "",
      species: "",
      birth_date: undefined,
      weight: 0,
      health_status: "",
      farmer_id: "",
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const addAnimalMut = useAddAnimal({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating animsl:", error);
      toast.error("Failed to add animal. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const onSubmit = async (data: AnimalFormData) => {
    try {
      const payload = {
        ...data,
      };
      await addAnimalMut.mutateAsync(payload);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating animal:", error);
    }
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    setOpenDrawer(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setOpenDialog(true);
    } else {
      setOpenDrawer(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) {
      setOpenDrawer(true);
    } else {
      handleCancel();
    }
  };

  const renderDrawerFooter = () => (
    <>
      <Button
        type="submit"
        form="animal-form"
        disabled={!isValid || addAnimalMut.isPending}
      >
        Submit
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </>
  );

  return (
    <>
      <Drawer
        open={openDrawer}
        onOpenChange={toggleDrawerState}
        trigger={
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add Animal
          </Button>
        }
        title="Add New Animal"
        footer={renderDrawerFooter()}
        hideFooterCloseButton
      >
        <Form {...form}>
          <form
            id="animal-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Animal name */}
            <FormField
              control={control}
              name="tag"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />

            {/* Species */}
            <FormField
              control={control}
              name="species"
              render={({ field }) => (
                <FormInputField label="Species" required {...field} />
              )}
            />

            {/* Planting date */}
            <Controller
              name="birth_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Birth Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />

            <FormField
              control={control}
              name="weight"
              render={({ field }) => (
                <FormInputField
                  type="number"
                  label="Weight (in kg)"
                  required
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <FormField
              control={control}
              name="health_status"
              render={({ field }) => (
                <FormInputField label="Health Status" required {...field} />
              )}
            />

            {/* Field select */}
            <FormField
              control={control}
              name="farmer_id"
              render={({ field }) => (
                <FormSelectField
                  label="Farmer"
                  required
                  fullWidth
                  options={farmersOptions}
                  {...field}
                />
              )}
            />
          </form>
        </Form>
      </Drawer>

      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Form"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
