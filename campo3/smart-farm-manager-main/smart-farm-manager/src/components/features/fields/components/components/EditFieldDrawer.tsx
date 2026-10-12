"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";

import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";
import { FIELD_LOCATIONS, SOIL_TYPES } from "@/utils/constants";

import type { Field } from "@/utils/hooks/api/fields/types";
import type { EditFieldDrawerProps } from "../types";

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

// Helper function to extract farmer_id as string
const getFarmerId = (farmerId: string | { _id: string; name: string }) => {
  return typeof farmerId === "object" ? farmerId._id : farmerId;
};

export const EditFieldDrawer = ({
  field,
  open,
  onOpenChange,
  onUpdate,
}: EditFieldDrawerProps) => {
  const [openDialog, setOpenDialog] = useState(false);

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
      name: field.name,
      area: field.area,
      location: field.location,
      soil_type: field.soil_type as
        | "Sandy"
        | "Clay"
        | "Silt"
        | "Peat"
        | "Chalk"
        | "Loam",
      farmer_id: getFarmerId(field.farmer_id),
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when field changes or drawer opens
  useEffect(() => {
    if (open && field) {
      reset({
        name: field.name,
        area: field.area,
        location: field.location,
        soil_type: field.soil_type as
          | "Sandy"
          | "Clay"
          | "Silt"
          | "Peat"
          | "Chalk"
          | "Loam",
        farmer_id: getFarmerId(field.farmer_id),
      });
    }
  }, [open, field, reset]);

  const onSubmit = async (data: FieldFormData) => {
    const updateData: Field = {
      _id: field._id,
      name: data.name,
      area: data.area,
      location: data.location,
      soil_type: data.soil_type,
      farmer_id: data.farmer_id,
    };

    if (onUpdate) {
      await onUpdate(updateData);
    }

    onOpenChange(false);
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (isFormUpdated) {
      setOpenDialog(true);
    } else {
      onOpenChange(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) {
      onOpenChange(true);
    } else {
      handleCancel();
    }
  };

  const renderDrawerFooter = () => (
    <>
      <Button onClick={handleSubmit(onSubmit)} disabled={!isValid}>
        Update
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </>
  );

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={toggleDrawerState}
        title="Edit Field"
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
        title="Cancel Changes"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
