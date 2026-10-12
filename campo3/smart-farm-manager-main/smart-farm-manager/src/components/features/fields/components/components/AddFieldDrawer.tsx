"use client";

import * as z from "zod";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { SOIL_TYPES, FIELD_LOCATIONS } from "@/utils/constants";

import { useAddField } from "@/utils/hooks/api/fields/usePostField";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

const fieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  area: z
    .number()
    .min(1, "Area must be greater than 0")
    .max(10000, "Area is too large"),
  location: z.string().min(1, "Location is required"),
  soil_type: z.enum(
    ["Sandy", "Clay", "Silt", "Peat", "Chalk", "Loam"],
    "Soil type is required"
  ),
  farmer_id: z.string().min(1, "Farmer ID is required"),
});

type FieldFormData = z.infer<typeof fieldSchema>;

export const AddFieldDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: farmers } = useFarmers();

  const farmerOptions = useMemo(() => {
    if (!farmers) return [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer._id,
    }));
  }, [farmers]);

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      area: 1,
      location: "",
      soil_type: "Sandy",
      farmer_id: "",
    },
    mode: "all",
  });

  const { watch, handleSubmit, reset, control, formState } = form;
  const { isValid } = formState;

  const formValues = watch();
  const isFormUpdated = useMemo(
    () => Object.values(formValues).some((value) => value !== ""),
    [formValues]
  );

  const addFieldMut = useAddField({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      toast.success("Field added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating field:", error);
      toast.error("Failed to add field. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });
  const isSubmitDisabled =
    !isValid || Object.keys(formValues).length === 0 || addFieldMut.isPending;

  const onSubmit = async (data: FieldFormData) => {
    try {
      await addFieldMut.mutateAsync(data);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating field:", error);
    }
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    setOpenDrawer(false);
  };

  const handleCancel = () => {
    if (isFormUpdated) setOpenDialog(true);
    else {
      setOpenDrawer(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) setOpenDrawer(true);
    else handleCancel();
  };

  const renderDrawerFooter = () => (
    <>
      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitDisabled}>
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
            Add Field
          </Button>
        }
        title="Add New Field"
        footer={renderDrawerFooter()}
        hideFooterCloseButton
      >
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />

            <FormField
              control={control}
              name="area"
              render={({ field }) => (
                <FormInputField
                  type="number"
                  label="Area (in hectares)"
                  required
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormSelectField
                  label="Location"
                  required
                  fullWidth
                  options={FIELD_LOCATIONS}
                  {...field}
                />
              )}
            />

            <FormField
              control={control}
              name="soil_type"
              render={({ field }) => (
                <FormSelectField
                  label="Soil Type"
                  required
                  fullWidth
                  options={SOIL_TYPES}
                  {...field}
                />
              )}
            />

            <FormField
              control={control}
              name="farmer_id"
              render={({ field }) => (
                <FormSelectField
                  label="Farmer"
                  required
                  fullWidth
                  options={farmerOptions}
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
